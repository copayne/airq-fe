/**
 * Next.js API Route for Ring Event History
 *
 * Fetches recent events from Ring cameras/doorbells AND alarm devices (contact sensors, etc.)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { RingApi } from 'ring-client-api';
import { env } from '~/env';

export interface RingEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  eventType: string;
  timestamp: string;
  answered?: boolean;
  duration?: number;
}

export interface RingHistoryResponse {
  success: boolean;
  events?: RingEvent[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RingHistoryResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  const { limit = '20' } = req.query;
  const eventLimit = Math.min(parseInt(String(limit), 10) || 20, 50);

  try {
    console.log('[Ring API] Fetching event history...');

    const ringApi = new RingApi({
      refreshToken: env.NEXT_PUBLIC_RING_REFRESH_TOKEN,
    });

    const locations = await ringApi.getLocations();
    const allEvents: RingEvent[] = [];

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
    for (const location of locations) {
      console.log(location, 'in location')
      // 1. Fetch camera events (motion, dings, live views)
      const cameras = location.cameras;
      for (const camera of cameras) {
        try {
          const historyResponse = await camera.getEvents({ limit: eventLimit });
          const cameraData = camera.data as any;
          const cameraName = cameraData.description ?? cameraData.name ?? 'Unknown Camera';
          const deviceId = String(cameraData.id ?? cameraData.device_id);

          for (const event of historyResponse.events ?? []) {
            const eventData = event as Record<string, any>;

            let eventType = 'unknown';
            if (eventData.kind === 'motion') {
              eventType = 'Motion Detected';
            } else if (eventData.kind === 'ding') {
              eventType = 'Doorbell Ring';
            } else if (eventData.kind === 'on_demand') {
              eventType = 'Live View';
            } else if (eventData.kind) {
              eventType = String(eventData.kind);
            }

            allEvents.push({
              id: String(eventData.id ?? eventData.ding_id ?? `${deviceId}-${eventData.created_at}`),
              deviceId,
              deviceName: cameraName,
              eventType,
              timestamp: eventData.created_at ?? new Date().toISOString(),
              answered: eventData.answered ?? undefined,
              duration: eventData.duration ?? undefined,
            });
          }
        } catch (cameraError) {
          console.warn(`[Ring API] Failed to get history for camera ${camera.name}:`, cameraError);
        }
      }

      // 2. Fetch alarm/sensor events (contact sensors, motion sensors, etc.)
      try {
        const alarmHistory = await location.getHistory({ limit: eventLimit });
        console.log(location, alarmHistory)

        // Build a device name lookup from current devices
        const devices = await location.getDevices();
        const deviceNameMap = new Map<string, string>();
        for (const device of devices) {
          const deviceData = device.data as any;
          const zid = String(deviceData.zid ?? deviceData.id ?? '');
          const name = String(deviceData.name ?? deviceData.description ?? 'Unknown Device');
          deviceNameMap.set(zid, name);
        }

        for (const event of alarmHistory) {
          const eventData = event as any;
          const body = eventData.body ?? {};

          // Only process events that have actual state change data
          // Skip if no faulted field (contact sensor state) and no clear event indicator
          if (body.faulted === undefined && body.mode === undefined) {
            continue; // Skip non-actionable events
          }

          // Get device info
          const deviceId = String(body.zid ?? 'unknown');
          const deviceName = deviceNameMap.get(deviceId) ?? String(body.name ?? 'Unknown Device');

          // Get timestamp - must have a real timestamp, skip if not
          const timestamp = eventData.time ?? body.lastUpdate ?? body.timestamp;
          if (!timestamp) {
            continue; // Skip events without timestamps
          }

          // Determine event type
          let eventType: string | null = null;

          if (body.faulted !== undefined) {
            // Contact sensor: faulted = true means open, false means closed
            eventType = body.faulted ? 'Door Opened' : 'Door Closed';
          } else if (body.mode !== undefined) {
            // Alarm mode changes
            const mode = String(body.mode).toLowerCase();
            if (mode === 'all' || mode === 'some') {
              eventType = 'Armed';
            } else if (mode === 'none') {
              eventType = 'Disarmed';
            }
          }

          // Only add if we determined a valid event type
          if (eventType) {
            allEvents.push({
              id: String(eventData.id ?? `alarm-${deviceId}-${timestamp}`),
              deviceId,
              deviceName,
              eventType,
              timestamp,
            });
          }
        }
      } catch (alarmError) {
        console.warn(`[Ring API] Failed to get alarm history for location ${location.name}:`, alarmError);
      }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */

    // Sort by timestamp descending (most recent first)
    allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit total events
    const limitedEvents = allEvents.slice(0, eventLimit);

    console.log(`[Ring API] Fetched ${limitedEvents.length} events`);

    return res.status(200).json({
      success: true,
      events: limitedEvents,
    });

  } catch (error) {
    console.error('[Ring API] Error fetching event history:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
