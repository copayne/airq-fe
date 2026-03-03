/**
 * Next.js API Route for Ring Device Real-time Events
 *
 * This server-side route uses Server-Sent Events (SSE) to stream
 * real-time Ring device notifications to the frontend.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getRingApi } from '~/lib/ringApiManager';

export interface RingDeviceEvent {
  deviceId: string;
  deviceType: string;
  name: string;
  status: string;
  batteryLevel?: number;
  timestamp: string;
}

// Keep track of active connections for logging
let activeConnections = 0;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering on nginx

  activeConnections++;
  console.log(`[Ring Events] Client connected (total: ${activeConnections})`);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  try {
    // Get centralized Ring API instance (handles token refresh automatically)
    const ringApi = await getRingApi();
    const locations = await ringApi.getLocations();

    // Subscribe to data updates from all locations
    for (const location of locations) {
      const devices = await location.getDevices();

      for (const device of devices) {
        // Subscribe to device data updates
        device.onData.subscribe((data) => {
          try {
            /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
            const deviceData = data as any;

            // Extract device type
            let deviceType = 'unknown';
            if ('deviceType' in deviceData) {
              deviceType = String(deviceData.deviceType);
            } else if ('kind' in deviceData) {
              deviceType = String(deviceData.kind);
            }

            // Extract battery level
            let batteryLevel: number | undefined;
            if ('batteryLevel' in deviceData && typeof deviceData.batteryLevel === 'number') {
              batteryLevel = deviceData.batteryLevel;
            } else if ('battery_life' in deviceData && typeof deviceData.battery_life === 'number') {
              batteryLevel = deviceData.battery_life;
            }

            // Extract status/state
            let status = 'unknown';
            if ('faulted' in deviceData) {
              // Contact sensors use 'faulted' (true = open, false = closed)
              status = deviceData.faulted ? 'open' : 'closed';
            } else if ('mode' in deviceData) {
              status = String(deviceData.mode);
            }

            const event: RingDeviceEvent = {
              deviceId: String(deviceData.id ?? deviceData.zid),
              deviceType,
              name: String(deviceData.description ?? 'Unknown Device'),
              status,
              batteryLevel,
              timestamp: new Date().toISOString(),
            };
            /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */

            console.log(`[Ring Events] Device update: ${event.name} - ${event.status}`);

            // Send event to client
            res.write(`data: ${JSON.stringify(event)}\n\n`);

          } catch (err) {
            console.error('[Ring Events] Error processing device data:', err);
          }
        });
      }
    }

    // Keep connection alive with periodic heartbeat
    const heartbeatInterval = setInterval(() => {
      res.write(`:heartbeat ${Date.now()}\n\n`);
    }, 30000); // Every 30 seconds

    // Cleanup on client disconnect
    req.on('close', () => {
      clearInterval(heartbeatInterval);
      activeConnections--;
      console.log(`[Ring Events] Client disconnected (remaining: ${activeConnections})`);

      // If no more active connections, we could clean up the Ring API instance
      // but keeping it alive is fine for reuse
      res.end();
    });

  } catch (error) {
    console.error('[Ring Events] Error setting up event stream:', error);
    activeConnections--;

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const tokenExpired = errorMessage.includes('Refresh token is not valid');
    res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage, tokenExpired })}\n\n`);
    res.end();
  }
}
