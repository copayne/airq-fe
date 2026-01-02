/**
 * Next.js API Route for getting the latest Ring camera snapshot
 *
 * Returns the most recent snapshot file for a given deviceId
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

export interface LatestSnapshotResponse {
  success: boolean;
  imageUrl?: string;
  deviceId?: string;
  timestamp?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LatestSnapshotResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { deviceId } = req.query;

    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ success: false, error: 'deviceId is required' });
    }

    const snapshotsDir = path.join(process.cwd(), 'public', 'ring-snapshots');

    // Check if directory exists
    try {
      await fs.access(snapshotsDir);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'No snapshots directory found'
      });
    }

    // Read all files in the snapshots directory
    const files = await fs.readdir(snapshotsDir);

    // Filter files for this deviceId and sort by filename (which includes timestamp)
    const deviceFiles = files
      .filter(file => file.startsWith(`ring-${deviceId}-`) && file.endsWith('.jpg'))
      .sort()
      .reverse(); // Most recent first (reverse alphabetical = newest timestamp first)

    if (deviceFiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No snapshots found for device ${deviceId}`
      });
    }

    // Get the most recent file
    const latestFile = deviceFiles[0];
    if (!latestFile) {
      return res.status(404).json({
        success: false,
        error: `No snapshots found for device ${deviceId}`
      });
    }

    const imageUrl = `/ring-snapshots/${latestFile}`;

    // Extract timestamp from filename: ring-{deviceId}-{timestamp}.jpg
    // Format: ring-59852574-2025-11-30T04-33-00-392Z.jpg
    const timestampMatch = latestFile.match(/ring-\d+-(.+)\.jpg$/);
    let timestamp = new Date().toISOString();

    if (timestampMatch?.[1]) {
      const rawTimestamp = timestampMatch[1];
      // Convert: 2025-11-30T04-33-00-392Z -> 2025-11-30T04:33:00.392Z
      const parts = rawTimestamp.split('T');
      if (parts.length === 2 && parts[0] && parts[1]) {
        const datePart = parts[0]; // 2025-11-30
        const timePart = parts[1]; // 04-33-00-392Z
        // Replace first two hyphens in time part with colons, third with dot
        const timeSegments = timePart.split('-');
        if (timeSegments.length === 4) {
          const hours = timeSegments[0];
          const minutes = timeSegments[1];
          const seconds = timeSegments[2];
          const millisAndZ = timeSegments[3]; // 392Z
          timestamp = `${datePart}T${hours}:${minutes}:${seconds}.${millisAndZ}`;
        }
      }
    }

    return res.status(200).json({
      success: true,
      imageUrl,
      deviceId,
      timestamp
    });

  } catch (error) {
    console.error('[Latest Snapshot] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}
