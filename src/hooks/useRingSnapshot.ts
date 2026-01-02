import { useState, useEffect, useRef } from 'react';

export interface RingSnapshot {
  imageUrl: string;
  deviceId: string;
  timestamp: string;
}

interface SnapshotResponse {
  success: boolean;
  imageUrl?: string;
  deviceId?: string;
  timestamp?: string;
  error?: string;
}

// Global cache to track auto-captured snapshots across component unmounts/remounts
const autoCaptureCache = new Map<string, boolean>();

export function useRingSnapshot(deviceId?: string, options?: { captureOnMount?: boolean }) {
  const [snapshot, setSnapshot] = useState<RingSnapshot | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track if we've already captured on mount to prevent re-capture on re-render
  const hasCapturedOnMount = useRef(false);

  const captureSnapshot = async () => {
    if (!deviceId) {
      setError(new Error('Device ID is required'));
      return;
    }

    setCapturing(true);
    setError(null);

    try {
      const response = await fetch('/api/ring/snapshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json() as SnapshotResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? 'Failed to capture snapshot');
      }

      if (data.imageUrl && data.deviceId && data.timestamp) {
        const newSnapshot: RingSnapshot = {
          imageUrl: data.imageUrl,
          deviceId: data.deviceId,
          timestamp: data.timestamp,
        };
        setSnapshot(newSnapshot);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Unknown error');
      setError(errorMessage);
      console.error('Error capturing snapshot:', err);
    } finally {
      setCapturing(false);
    }
  };

  // Load the latest snapshot from disk on mount
  useEffect(() => {
    const loadLatestSnapshot = async () => {
      if (!deviceId) return;

      try {
        const response = await fetch(`/api/ring/latest-snapshot?deviceId=${deviceId}`);
        const data = await response.json() as SnapshotResponse;

        if (response.ok && data.success && data.imageUrl && data.deviceId && data.timestamp) {
          const existingSnapshot: RingSnapshot = {
            imageUrl: data.imageUrl,
            deviceId: data.deviceId,
            timestamp: data.timestamp,
          };
          setSnapshot(existingSnapshot);
        }
      } catch (err) {
        // Silently fail - we'll capture a new snapshot anyway
        console.log('[Ring Snapshot] No existing snapshot found, will capture new one');
      }
    };

    void loadLatestSnapshot();
  }, [deviceId]);

  // Auto-capture on mount if requested and not already captured globally
  useEffect(() => {
    if (options?.captureOnMount && deviceId && !hasCapturedOnMount.current) {
      // Check global cache to see if we've already auto-captured for this device
      const cacheKey = `auto-capture-${deviceId}`;

      if (!autoCaptureCache.get(cacheKey)) {
        hasCapturedOnMount.current = true;
        autoCaptureCache.set(cacheKey, true);
        void captureSnapshot();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, options?.captureOnMount]); // Re-run only if deviceId or captureOnMount option changes

  return {
    snapshot,
    error,
    capturing,
    captureSnapshot,
  };
}
