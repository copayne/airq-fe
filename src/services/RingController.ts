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

export class RingController {
  private static instance: RingController | null = null;

  private apolloClient: ApolloClient<NormalizedCacheObject>;
  private devices = new Map<string, RingDeviceData>();
  private listeners = new Set<() => void>();
  private isInitialized = false;
  private eventSource: EventSource | null = null;

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

      // Connect to real-time event stream for status updates
      this.connectToEventStream();

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

      // Convert to RingDeviceData and update local cache
      // Note: batteryLevel, status, and lastUpdate come from websocket, not DB
      this.devices.clear();
      for (const device of dbDevices) {
        const deviceData: RingDeviceData = {
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          name: device.name,
          location: device.location,
          batteryLevel: null, // Will be updated via websocket
          status: null, // Will be updated via websocket
          lastUpdate: null, // Will be updated via websocket
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
        throw new Error(`Ring API request failed: ${response.statusText}`);
      }

      const data = await response.json() as { success: boolean; devices?: RingDeviceData[]; error?: string };

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
      } else {
        throw new Error(result.data?.batchUpdateRingDevices.message ?? 'Batch update failed');
      }

    } catch (error) {
      console.error('[RingController] Failed to sync to database:', error);
      throw error;
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
