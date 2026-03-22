import React, { memo } from 'react';
import type { RingDeviceData } from '~/services/RingController';

interface CameraCardProps {
  devices: RingDeviceData[];
}

const CameraCard: React.FC<CameraCardProps> = memo(({ devices }) => {
  if (devices.length === 0) {
    return (
      <div className="h-full vfd-panel px-3 py-2">
        <div className="relative z-[2]">
          <span className="vfd-label">CAMERAS</span>
          <p className="font-mono text-[10px] vfd-ghost mt-2">No feeds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full vfd-panel px-3 py-2 flex flex-col">
      <div className="relative z-[2] flex flex-col h-full">
        {/* Zone label */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <span className="vfd-label">CAMERAS</span>
          <span className="font-mono text-[9px] tracking-[0.15em] vfd-ghost">
            {devices.length}
          </span>
        </div>

        {/* Camera list */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-0">
          {devices.map((device) => {
            const isOnline = device.status === 'online';

            return (
              <div
                key={device.deviceId}
                className="flex items-center gap-2 py-1.5"
                style={{ borderBottom: '1px solid var(--vfd-hairline)' }}
              >
                <div
                  className={`vfd-dot ${isOnline ? 'vfd-dot-red vfd-breathe' : 'vfd-dot-off'}`}
                  style={{ width: '4px', height: '4px' }}
                />
                <span className={`font-mono text-[10px] tracking-[0.03em] truncate flex-1 ${isOnline ? 'vfd-dim' : 'vfd-ghost'}`}>
                  {device.name}
                </span>
                <span className={`font-mono text-[9px] tracking-[0.15em] flex-shrink-0 ${isOnline ? 'vfd-glow-red' : 'vfd-ghost'}`}>
                  {isOnline ? 'REC' : 'OFF'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

CameraCard.displayName = 'CameraCard';

export default CameraCard;
