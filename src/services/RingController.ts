/**
 * RingController - Frontend service for Ring device integration
 *
 * Manages Ring device data via real-time websocket updates.
 * This controller:
 * - Fetches initial device list from database
 * - Connects to websocket for real-time status updates
 * - Maintains local cache of device data
 * - Exposes current device data for components to consume
 */

import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { GET_RING_DEVICES, BATCH_UPDATE_RING_DEVICES } from '~/graphql/Ring';
import type {
  GetRingDevicesData,
  RingDeviceInput,
  BatchUpdateRingDevicesData
} from '~/types/sensors';

export interface RingControllerConfig {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

export interface RingDeviceData {
  deviceId: string;
  deviceType: string;
  name: string;
  location: string;
  batteryLevel: number | null;
  status: string | null;
  lastUpdate: string | null;
}

export interface RingTokenStatus {
  status: string;
  error?: string;
  lastRefresh?: string;
  hasToken: boolean;
}

export class RingController {
  private static instance: RingController | null = null;

  private apolloClient: ApolloClient<NormalizedCacheObject>;
  private devices = new Map<string, RingDeviceData>();
  private listeners = new Set<() => void>();
  private isInitialized = false;
  private eventSource: EventSource | null = null;
  private tokenExpired = false;

  private constructor(config: RingControllerConfig) {
    this.apolloClient = config.apolloClient;
  }

  /**
   * Get singleton instance of RingController
   */
  static getInstance(config?: RingControllerConfig): RingController {
    if (!RingController.instance) {
      if (!config) {
        throw new Error('RingController config required for first initialization');
      }
      RingController.instance = new RingController(config);
    }
    return RingController.instance;
  }

  /**
   * Initialize controller - load device list from DB and connect to real-time events
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[RingController] Already initialized');
      return;
    }

    console.log('[RingController] Initializing...');

    try {
      // Load initial device list from database
      await this.loadDevicesFromDb();

      // If no devices in DB, auto-sync from Ring API to populate the database
      if (this.devices.size === 0) {
        console.log('[RingController] No devices in database, auto-syncing from Ring API...');
        try {
          await this.syncToDatabase();
        } catch (syncError) {
          console.warn('[RingController] Auto-sync failed, continuing without DB devices:', syncError);
        }
      }

      // Connect to real-time event stream for status updates
      this.connectToEventStream();

      // Fetch live status from Ring API in the background (non-blocking).
      // This populates status/battery/lastUpdate without delaying initialization.
      void this.fetchLiveDeviceState();

      this.isInitialized = true;
      console.log('[RingController] Initialized successfully with real-time websocket updates');
    } catch (error) {
      console.error('[RingController] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Connect to Server-Sent Events stream for real-time device updates
   */
  private connectToEventStream(): void {
    if (this.eventSource) {
      console.log('[RingController] Event stream already connected');
      return;
    }

    console.log('[RingController] Connecting to event stream...');

    try {
      this.eventSource = new EventSource('/api/ring/events');

      this.eventSource.onopen = () => {
        console.log('[RingController] Event stream connected');
      };

      this.eventSource.onmessage = (event) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const data = JSON.parse(event.data) as { type?: string; deviceId?: string; status?: string; batteryLevel?: number; timestamp?: string };

          // Handle different event types
          if (data.type === 'connected') {
            console.log('[RingController] Event stream handshake successful');
            return;
          }

          if (data.type === 'error') {
            console.error('[RingController] Event stream error:', data);
            const eventData = data as { type: string; tokenExpired?: boolean };
            if (eventData.tokenExpired) {
              this.tokenExpired = true;
              this.notifyListeners();
            }
            return;
          }

          // Device update event
          if (data.deviceId) {
            console.log(`[RingController] Real-time update: ${data.deviceId} - ${data.status}`);
            this.handleDeviceUpdate(data);
          }

        } catch (err) {
          console.error('[RingController] Error parsing event:', err);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('[RingController] Event stream error:', error);

        // Try to reconnect after a delay
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          console.log('[RingController] Event stream closed, reconnecting in 5s...');
          setTimeout(() => {
            this.eventSource = null;
            this.connectToEventStream();
          }, 5000);
        }
      };

    } catch (error) {
      console.error('[RingController] Failed to connect to event stream:', error);
    }
  }

  /**
   * Handle real-time device update from event stream
   */
  private handleDeviceUpdate(data: { deviceId?: string; status?: string; batteryLevel?: number; timestamp?: string }): void {
    const deviceId = data.deviceId;
    if (!deviceId) return;

    // Get existing device data
    const existingDevice = this.devices.get(deviceId);

    if (existingDevice) {
      // Update only changed fields in local cache
      const updatedDevice: RingDeviceData = {
        ...existingDevice,
        status: data.status ?? existingDevice.status,
        batteryLevel: data.batteryLevel ?? existingDevice.batteryLevel,
        lastUpdate: data.timestamp ?? new Date().toISOString(),
      };

      this.devices.set(deviceId, updatedDevice);

      // Notify listeners of update
      this.notifyListeners();
    } else {
      // New device discovered, reload device list from DB
      console.log('[RingController] New device discovered, reloading device list');
      void this.loadDevicesFromDb();
    }
  }


  /**
   * Fetch live device state from Ring API to populate status, battery, and lastUpdate.
   * The database only stores static info (name, type, location), so we need a live
   * fetch to get current open/closed status and battery levels.
   */
  private async fetchLiveDeviceState(): Promise<void> {
    try {
      console.log('[RingController] Fetching live device state from Ring API...');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch('/api/ring/sync', { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        if (response.status === 401) {
          this.tokenExpired = true;
          this.notifyListeners();
        }
        console.warn('[RingController] Failed to fetch live state, devices will update via SSE');
        return;
      }

      const data = await response.json() as { success: boolean; devices?: RingDeviceData[]; error?: string; tokenExpired?: boolean };

      if (data.tokenExpired) {
        this.tokenExpired = true;
        this.notifyListeners();
        return;
      }

      if (!data.success || !data.devices) {
        console.warn('[RingController] Live state fetch returned no devices');
        return;
      }

      // Merge live state into cached devices
      for (const liveDevice of data.devices) {
        const cached = this.devices.get(liveDevice.deviceId);
        if (cached) {
          this.devices.set(liveDevice.deviceId, {
            ...cached,
            status: liveDevice.status,
            batteryLevel: liveDevice.batteryLevel,
            lastUpdate: liveDevice.lastUpdate,
          });
        } else {
          // Device exists in Ring but not in DB — add it to the local cache
          this.devices.set(liveDevice.deviceId, liveDevice);
        }
      }

      console.log(`[RingController] Updated ${data.devices.length} devices with live state`);
      this.notifyListeners();

    } catch (error) {
      console.warn('[RingController] Failed to fetch live device state:', error);
      // Non-fatal: devices will still update via SSE when state changes
    }
  }

  /**
   * Load devices from database and populate local cache
   */
  private async loadDevicesFromDb(): Promise<void> {
    try {
      console.log('[RingController] Loading devices from database...');

      const { data } = await this.apolloClient.query<GetRingDevicesData>({
        query: GET_RING_DEVICES,
        fetchPolicy: 'network-only', // Always fetch fresh data
      });

      const dbDevices = data.ringDevices;
      console.log(`[RingController] Loaded ${dbDevices.length} devices from database`);

      // Convert to RingDeviceData and update local cache.
      // Preserve existing live state (status/battery/lastUpdate) if we already
      // have it from a previous sync or SSE update.
      const previousDevices = new Map(this.devices);
      this.devices.clear();
      for (const device of dbDevices) {
        const existing = previousDevices.get(device.deviceId);
        const deviceData: RingDeviceData = {
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          name: device.name,
          location: device.location,
          batteryLevel: existing?.batteryLevel ?? null,
          status: existing?.status ?? null,
          lastUpdate: existing?.lastUpdate ?? null,
        };
        this.devices.set(device.deviceId, deviceData);
      }

      // Notify listeners
      this.notifyListeners();

    } catch (error) {
      console.error('[RingController] Failed to load devices from database:', error);
      throw error;
    }
  }

  /**
   * Get current devices from local cache
   */
  getDevices(): RingDeviceData[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get specific device by ID
   */
  getDevice(deviceId: string): RingDeviceData | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Subscribe to device updates
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of data changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Manually refresh device list from database
   * Useful when new devices are added to the Ring account
   */
  async refresh(): Promise<void> {
    console.log('[RingController] Manual refresh requested');
    await this.loadDevicesFromDb();
    await this.fetchLiveDeviceState();
  }

  /**
   * Sync devices from Ring API to database
   * Fetches current device data from Ring and updates database with latest names, locations, etc.
   */
  async syncToDatabase(): Promise<void> {
    try {
      console.log('[RingController] Syncing devices from Ring API to database...');

      // Fetch latest devices from Ring API
      const response = await fetch('/api/ring/sync');

      if (!response.ok) {
        if (response.status === 401) {
          this.tokenExpired = true;
          this.notifyListeners();
        }
        throw new Error(`Ring API request failed: ${response.statusText}`);
      }

      const data = await response.json() as { success: boolean; devices?: RingDeviceData[]; error?: string; tokenExpired?: boolean };

      if (data.tokenExpired) {
        this.tokenExpired = true;
        this.notifyListeners();
        throw new Error('Ring refresh token expired');
      }

      if (!data.success || !data.devices) {
        throw new Error(data.error ?? 'Failed to fetch Ring devices');
      }

      const ringDevices = data.devices;
      console.log(`[RingController] Fetched ${ringDevices.length} devices from Ring API`);

      // Convert to input format for batch update
      // Only send static device info (name, type, location) - not status/battery
      const deviceInputs: RingDeviceInput[] = ringDevices.map(device => ({
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        name: device.name,
        location: device.location,
      }));

      // Send batch update to database
      const result = await this.apolloClient.mutate<BatchUpdateRingDevicesData>({
        mutation: BATCH_UPDATE_RING_DEVICES,
        variables: { devices: deviceInputs },
      });

      if (result.data?.batchUpdateRingDevices.success) {
        console.log(
          `[RingController] Database sync successful: ` +
          `${result.data.batchUpdateRingDevices.devicesUpdated} updated, ` +
          `${result.data.batchUpdateRingDevices.devicesCreated} created`
        );

        // Reload devices from database to update local cache
        await this.loadDevicesFromDb();

        // Merge live status/battery/lastUpdate from the Ring API response
        // back into the cache (loadDevicesFromDb sets these to null)
        for (const liveDevice of ringDevices) {
          const cached = this.devices.get(liveDevice.deviceId);
          if (cached) {
            this.devices.set(liveDevice.deviceId, {
              ...cached,
              status: liveDevice.status,
              batteryLevel: liveDevice.batteryLevel,
              lastUpdate: liveDevice.lastUpdate,
            });
          }
        }
        this.notifyListeners();
      } else {
        throw new Error(result.data?.batchUpdateRingDevices.message ?? 'Batch update failed');
      }

    } catch (error) {
      console.error('[RingController] Failed to sync to database:', error);
      throw error;
    }
  }

  getTokenExpired(): boolean {
    return this.tokenExpired;
  }

  async updateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/ring/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json() as { success: boolean };

      if (data.success) {
        this.tokenExpired = false;

        // Close existing event stream so it reconnects with new credentials
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        // Re-initialize: reload devices and reconnect SSE
        this.isInitialized = false;
        await this.initialize();
        return true;
      }

      return false;
    } catch (error) {
      console.error('[RingController] Failed to update token:', error);
      return false;
    }
  }

  async getTokenStatus(): Promise<RingTokenStatus> {
    try {
      const response = await fetch('/api/ring/token');
      return await response.json() as RingTokenStatus;
    } catch {
      return { status: 'error', hasToken: false, error: 'Failed to fetch token status' };
    }
  }

  /**
   * Cleanup and destroy controller instance
   */
  destroy(): void {
    // Close event stream connection
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('[RingController] Event stream closed');
    }

    this.devices.clear();
    this.listeners.clear();
    this.isInitialized = false;
    RingController.instance = null;
    console.log('[RingController] Destroyed');
  }
}
