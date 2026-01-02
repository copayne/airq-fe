/**
 * Next.js API Route for Ring Camera Snapshot Capture
 *
 * This server-side route uses ring-client-api to capture snapshots from Ring cameras.
 * Replaces the old ring-snap binary approach with native API support.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { RingApi } from 'ring-client-api';
import { env } from '~/env';
import fs from 'fs/promises';
import path from 'path';

export interface SnapshotResponse {
  success: boolean;
  imageUrl?: string;
  deviceId?: string;
  timestamp?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SnapshotResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { deviceId } = req.body as { deviceId?: string };

    if (!deviceId) {
      return res.status(400).json({ success: false, error: 'deviceId is required' });
    }

    console.log(`[Ring Snapshot] Capturing snapshot for camera ${deviceId}...`);

    // Initialize Ring API (server-side only)
    const ringApi = new RingApi({
      refreshToken: env.NEXT_PUBLIC_RING_REFRESH_TOKEN,
    });

    const locations = await ringApi.getLocations();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let targetCamera: any = null;

    // Find the camera by device ID
    for (const location of locations) {
      const cameras = location.cameras;
      for (const camera of cameras) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (String(camera.data.id) === String(deviceId) || String(camera.data.device_id) === String(deviceId)) {
          targetCamera = camera;
          break;
        }
      }
      if (targetCamera) break;
    }

    if (!targetCamera) {
      return res.status(404).json({
        success: false,
        error: `Camera with device ID ${deviceId} not found`
      });
    }

    // Capture snapshot from camera
    console.log(`[Ring Snapshot] Requesting snapshot from Ring API...`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const snapshotBuffer = await targetCamera.getSnapshot() as Buffer;

    if (!snapshotBuffer || snapshotBuffer.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to capture snapshot from camera'
      });
    }

    // Save snapshot to disk
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ring-${deviceId}-${timestamp}.jpg`;
    const snapshotsDir = path.join(process.cwd(), 'public', 'ring-snapshots');
    const filepath = path.join(snapshotsDir, filename);

    // Ensure directory exists
    await fs.mkdir(snapshotsDir, { recursive: true });

    // Write image to disk
    await fs.writeFile(filepath, snapshotBuffer);

    console.log(`[Ring Snapshot] Snapshot saved to ${filepath}`);

    // Return public URL
    const imageUrl = `/ring-snapshots/${filename}`;

    return res.status(200).json({
      success: true,
      imageUrl,
      deviceId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Ring Snapshot] Error capturing snapshot:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}
