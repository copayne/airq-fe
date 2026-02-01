import React, { useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRingSnapshot } from '~/hooks/useRingSnapshot';
import { useRingDevices } from '~/hooks/useRingDevices';
import { formatShortDateTime } from '~/utils/dateUtils';
import type { RingSnapshotConfig } from '~/types/widgetConfig';

interface RingSnapshotCardProps {
  deviceId?: string;
  cameraName?: string;
  config?: RingSnapshotConfig;
}

const RingSnapshotCard: React.FC<RingSnapshotCardProps> = ({ deviceId: propDeviceId, cameraName: propCameraName, config }) => {
  const showTimestamp = config?.showTimestamp ?? true;
  const showCaptureButton = config?.showCaptureButton ?? true;
  const autoRefresh = config?.autoRefresh ?? false;
  const refreshInterval = config?.refreshInterval ?? 300;
  // Fetch ring devices to auto-detect camera if no deviceId provided
  const { devices } = useRingDevices({ pollInterval: 0, fetchPolicy: 'cache-first' });

  // Find first camera if no deviceId prop provided
  const { deviceId, cameraName } = useMemo(() => {
    if (propDeviceId) {
      // If deviceId provided, find matching device for camera name
      const device = devices.find(d => d.deviceId === propDeviceId);
      return {
        deviceId: propDeviceId,
        cameraName: propCameraName ?? device?.name ?? 'Ring Camera',
      };
    }

    // Auto-detect: find first camera device (deviceType contains 'camera')
    const camera = devices.find(d =>
      d.deviceType.toLowerCase().includes('camera') ||
      d.deviceType.toLowerCase().includes('doorbell')
    );

    if (camera) {
      return {
        deviceId: camera.deviceId,
        cameraName: propCameraName ?? camera.name ?? 'Ring Camera',
      };
    }

    return { deviceId: undefined, cameraName: propCameraName ?? 'Ring Camera' };
  }, [propDeviceId, propCameraName, devices]);

  const { snapshot, error, capturing, captureSnapshot } = useRingSnapshot(deviceId, { captureOnMount: true });

  // Auto-refresh support
  const captureRef = useRef(captureSnapshot);
  captureRef.current = captureSnapshot;
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;
    const interval = setInterval(() => {
      void captureRef.current();
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Image URL is relative to Next.js public directory
  const imageUrl = snapshot?.imageUrl ?? '';

  const formatTimestamp = (timestamp: string) => {
    return formatShortDateTime(timestamp);
  };

  if (error && !snapshot) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-airq-light p-4">
        <p className="text-airq-tertiary text-sm mb-4">Error loading snapshot</p>
        <button
          onClick={() => captureSnapshot()}
          disabled={capturing}
          className="px-4 py-2 bg-airq-dark text-airq-light border-[1px] border-airq-dark hover:bg-airq-dark/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {capturing ? 'Capturing...' : 'Retry'}
        </button>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-airq-light p-4">
        <p className="text-airq-dark text-sm mb-4">No snapshot available</p>
        <button
          onClick={() => captureSnapshot()}
          disabled={capturing}
          className="px-4 py-2 bg-airq-dark text-airq-light border-[1px] border-airq-dark hover:bg-airq-dark/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {capturing ? 'Capturing...' : 'Capture Snapshot'}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-airq-light">
      <div className="relative flex-1 bg-airq-dark/5">
        {capturing && (
          <div className="absolute inset-0 bg-airq-dark/50 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-airq-light mb-2"></div>
              <p className="text-airq-light text-xs font-medium">Capturing...</p>
            </div>
          </div>
        )}
        <Image
          src={imageUrl}
          alt={`Ring camera snapshot from ${cameraName}`}
          fill
          unoptimized={true}
          className="object-contain p-1"
          priority
        />
      </div>
      {(showTimestamp || showCaptureButton) && (
        <div className="border-t-[1px] border-airq-dark bg-airq-light px-2 py-1.5 flex justify-between items-center">
          {showTimestamp ? (
            <div className="flex flex-col">
              <p className="text-[10px] text-airq-dark/75">
                {cameraName}
              </p>
              <p className="text-[10px] text-airq-dark font-medium">
                {snapshot && formatTimestamp(snapshot.timestamp)}
              </p>
            </div>
          ) : <div />}
          {showCaptureButton && (
            <button
              onClick={() => captureSnapshot()}
              disabled={capturing}
              className="px-2 py-1 bg-airq-dark text-airq-light border-[1px] border-airq-dark hover:bg-airq-dark/90 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium touch-manipulation"
            >
              {capturing ? '...' : 'Capture'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

RingSnapshotCard.displayName = 'RingSnapshotCard';

export default RingSnapshotCard;
