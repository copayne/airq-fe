/**
 * Next.js API Route for Ring Device Sync
 *
 * This server-side route uses ring-client-api to fetch device data
 * and returns it to the frontend. Runs only on the Node.js server.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { RingApi } from 'ring-client-api';
import { env } from '~/env';

export interface RingDeviceData {
  deviceId: string;
  deviceType: string;
  name: string;
  location: string;
  batteryLevel: number | null;
  status: string | null;
  lastUpdate: string | null;
}

export interface RingSyncResponse {
  success: boolean;
  devices?: RingDeviceData[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RingSyncResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('[Ring API] Fetching devices from Ring...');

    // Initialize Ring API (server-side only)
    const ringApi = new RingApi({
      refreshToken: env.NEXT_PUBLIC_RING_REFRESH_TOKEN,
    });

    const locations = await ringApi.getLocations();
    const devices: RingDeviceData[] = [];

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    for (const location of locations) {
      // Get regular devices (sensors, keypads, etc.)
      const locationDevices = await location.getDevices();

      // Get cameras (this is a property, not a promise)
      const cameras = location.cameras;

      // Process regular devices
      for (const device of locationDevices) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deviceData = device.data as any;

        // Extract device type
        let deviceType = 'unknown';
        if ('deviceType' in deviceData) {
          deviceType = String(deviceData.deviceType);
        } else if ('kind' in deviceData) {
          deviceType = String(deviceData.kind);
        }

        // Extract battery level
        let batteryLevel: number | null = null;
        if ('batteryLevel' in deviceData && typeof deviceData.batteryLevel === 'number') {
          batteryLevel = deviceData.batteryLevel;
        } else if ('battery_life' in deviceData && typeof deviceData.battery_life === 'number') {
          batteryLevel = deviceData.battery_life;
        }

        // Extract status/state
        let status: string | null = null;
        if ('faulted' in deviceData) {
          // Contact sensors use 'faulted' (true = open, false = closed)
          status = deviceData.faulted ? 'open' : 'closed';
        } else if ('mode' in deviceData) {
          status = String(deviceData.mode);
        }

        // Extract device name - try multiple possible fields
        let deviceName = 'Unknown Device';
        if (deviceData.name) {
          deviceName = String(deviceData.name);
        } else if (deviceData.description) {
          deviceName = String(deviceData.description);
        } else if (deviceData.label) {
          deviceName = String(deviceData.label);
        } else if (deviceData.alias) {
          deviceName = String(deviceData.alias);
        }

        devices.push({
          deviceId: String(deviceData.id ?? deviceData.zid),
          deviceType,
          name: deviceName,
          location: location.name,
          batteryLevel,
          status,
          lastUpdate: new Date().toISOString(),
        });
      }

      // Process cameras
      for (const camera of cameras) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cameraData = camera.data as any;

        // Extract camera type
        let cameraType = 'camera';
        if (cameraData.kind) {
          cameraType = String(cameraData.kind);
        } else if (cameraData.device_type) {
          cameraType = String(cameraData.device_type);
        }

        // Extract camera name
        let cameraName = 'Unknown Camera';
        if (cameraData.description) {
          cameraName = String(cameraData.description);
        } else if (cameraData.name) {
          cameraName = String(cameraData.name);
        }

        // Extract battery level (if battery powered)
        let batteryLevel: number | null = null;
        if ('battery_life' in cameraData && typeof cameraData.battery_life === 'number') {
          batteryLevel = cameraData.battery_life;
        } else if ('battery_level' in cameraData && typeof cameraData.battery_level === 'number') {
          batteryLevel = cameraData.battery_level;
        }

        // Camera status (online/offline)
        let status: string | null = null;
        if ('online' in cameraData) {
          status = cameraData.online ? 'online' : 'offline';
        }

        devices.push({
          deviceId: String(cameraData.id ?? cameraData.device_id),
          deviceType: cameraType,
          name: cameraName,
          location: location.name,
          batteryLevel,
          status,
          lastUpdate: new Date().toISOString(),
        });
      }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    console.log(`[Ring API] Fetched ${devices.length} devices`);

    return res.status(200).json({
      success: true,
      devices,
    });

  } catch (error) {
    console.error('[Ring API] Error fetching devices:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
