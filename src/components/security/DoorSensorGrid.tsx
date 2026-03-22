import React, { memo } from 'react';
import type { RingDeviceData } from '~/services/RingController';
import { getRelativeTime } from '~/utils/dateUtils';

interface DoorSensorGridProps {
  devices: RingDeviceData[];
}

const DoorSensorGrid: React.FC<DoorSensorGridProps> = memo(({ devices }) => {
  if (devices.length === 0) {
    return (
      <div className="vfd-panel px-4 py-2">
        <div className="relative z-[2] flex items-center gap-4">
          <span className="vfd-label">PERIMETER</span>
          <span className="font-mono text-[10px] vfd-ghost">No sensors</span>
        </div>
      </div>
    );
  }

  const openCount = devices.filter(d => d.status === 'open').length;

  return (
    <div className="vfd-panel px-4 py-2.5">
      <div className="relative z-[2]">
        {/* Zone header row */}
        <div className="flex items-center gap-4 mb-2">
          <span className="vfd-label">PERIMETER</span>
          <span className="font-mono text-[9px] tracking-[0.15em] vfd-ghost">
            {devices.length} ZONE{devices.length !== 1 ? 'S' : ''}
          </span>
          {openCount > 0 && (
            <span className="font-mono text-[10px] tracking-wider vfd-glow-red vfd-breathe">
              {openCount} OPEN
            </span>
          )}
        </div>

        {/* Sensor grid — dense horizontal rows like a VFD channel display */}
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {devices.map((device) => {
            const isOpen = device.status === 'open';
            const batteryLow = device.batteryLevel !== null && device.batteryLevel <= 20;

            return (
              <div key={device.deviceId} className="flex items-center gap-2 min-w-[140px]">
                <div
                  className={`vfd-dot ${isOpen ? 'vfd-dot-amber vfd-breathe' : 'vfd-dot-on'}`}
                  style={{ width: '4px', height: '4px' }}
                />
                <span className={`font-mono text-[11px] tracking-[0.05em] truncate ${isOpen ? 'vfd-glow-amber' : 'vfd-dim'}`}>
                  {device.name}
                </span>
                <span className={`font-mono text-[10px] tracking-[0.1em] font-medium ${isOpen ? 'vfd-glow-amber' : 'vfd-glow'}`}>
                  {isOpen ? 'OPEN' : 'OK'}
                </span>
                {batteryLow && (
                  <span className="font-mono text-[9px] vfd-glow-red">{device.batteryLevel}%</span>
                )}
                <span className="font-mono text-[9px] tracking-wider vfd-ghost">
                  {getRelativeTime(device.lastUpdate, '--:--')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

DoorSensorGrid.displayName = 'DoorSensorGrid';

export default DoorSensorGrid;
