import React, { memo } from 'react';
import type { RingDeviceData } from '~/services/RingController';

interface DeviceHealthGridProps {
  devices: RingDeviceData[];
}

function isDeviceOnline(device: RingDeviceData): boolean {
  if (!device.status) return false;
  if (device.status === 'offline') return false;
  return true;
}

const DeviceHealthGrid: React.FC<DeviceHealthGridProps> = memo(({ devices }) => {
  if (devices.length === 0) {
    return (
      <div className="h-full vfd-panel px-3 py-2">
        <div className="relative z-[2]">
          <span className="vfd-label">SYSTEM</span>
          <p className="font-mono text-[10px] vfd-ghost mt-2">No devices</p>
        </div>
      </div>
    );
  }

  const onlineCount = devices.filter(isDeviceOnline).length;

  return (
    <div className="h-full vfd-panel px-3 py-2 flex flex-col">
      <div className="relative z-[2] flex flex-col h-full">
        {/* Zone label + count */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <span className="vfd-label">SYSTEM</span>
          <div className="flex items-baseline gap-1.5">
            <span className="vfd-display text-sm font-semibold tracking-[0.1em] vfd-glow-amber">
              {onlineCount}
            </span>
            <span className="font-mono text-[9px] vfd-ghost">/</span>
            <span className="font-mono text-[9px] tracking-wider vfd-ghost">
              {devices.length}
            </span>
          </div>
        </div>

        {/* Device list */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-0">
          {devices.map((device) => {
            const online = isDeviceOnline(device);
            const batteryLow = device.batteryLevel !== null && device.batteryLevel <= 20;

            return (
              <div
                key={device.deviceId}
                className="flex items-center justify-between py-1"
                style={{ borderBottom: '1px solid var(--vfd-hairline)' }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                  <div
                    className={`vfd-dot ${online ? 'vfd-dot-on' : 'vfd-dot-off'}`}
                    style={{ width: '3px', height: '3px' }}
                  />
                  <span className={`font-mono text-[10px] tracking-[0.02em] truncate ${online ? 'vfd-dim' : 'vfd-ghost'}`}>
                    {device.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {device.batteryLevel !== null && (
                    <span className={`font-mono text-[9px] tracking-wider ${batteryLow ? 'vfd-glow-red' : 'vfd-ghost-amber'}`}>
                      {device.batteryLevel}%
                    </span>
                  )}
                  <span className={`font-mono text-[8px] tracking-[0.12em] ${online ? 'vfd-glow' : 'vfd-ghost'}`}>
                    {online ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

DeviceHealthGrid.displayName = 'DeviceHealthGrid';

export default DeviceHealthGrid;
