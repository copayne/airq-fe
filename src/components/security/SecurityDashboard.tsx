import React, { memo, useCallback } from 'react';
import { useRing } from '~/context/RingContext';
import { useSecurity } from '~/context/SecurityContext';
import { AlertTriangle } from 'lucide-react';
import AlarmStatusPanel, { type AlarmMode } from './AlarmStatusPanel';
import DoorSensorGrid from './DoorSensorGrid';
import CameraCard from './CameraCard';
import DeviceHealthGrid from './DeviceHealthGrid';
import EventTimeline from './EventTimeline';

// Substrings to match against device names for hiding infrastructure devices
const HIDDEN_DEVICE_PATTERNS = [
  'zigbee',
  'z-wave',
  'shadow adapter',
  'access code',
  'code vault',
];

// Ring alarm panel mode values → dashboard alarm mode
function resolveAlarmMode(panelStatus: string | null): AlarmMode {
  switch (panelStatus) {
    case 'all': return 'away';
    case 'some': return 'home';
    case 'none': return 'disarmed';
    default: return 'unknown';
  }
}

const SecurityDashboard: React.FC = memo(() => {
  const { devices: ringDevices, isInitialized: ringInit, tokenExpired, error: ringError, refresh } = useRing();
  const { events } = useSecurity();

  // Refresh device data after alarm mode change (short delay for Ring to propagate)
  const handleModeChange = useCallback(() => {
    setTimeout(() => void refresh(), 2000);
  }, [refresh]);

  // Filter out hidden infrastructure devices (case-insensitive substring match)
  const visibleDevices = ringDevices.filter((d) => {
    const lower = d.name.toLowerCase();
    return !HIDDEN_DEVICE_PATTERNS.some((p) => lower.includes(p));
  });

  // Find the security panel to get alarm mode
  const securityPanel = ringDevices.find(
    (d) => d.deviceType === 'security-panel' || d.deviceType.includes('security-panel')
  );
  const alarmMode = resolveAlarmMode(securityPanel?.status ?? null);

  const contactSensors = visibleDevices.filter(
    (d) => d.deviceType === 'sensor.contact' || d.deviceType.includes('contact')
  );

  const cameras = visibleDevices.filter(
    (d) => d.deviceType === 'camera' || d.deviceType.includes('cam') || d.deviceType.includes('doorbell')
  );

  if (tokenExpired) {
    return (
      <div className="h-full-no-header relative" style={{ background: 'var(--vfd-bg)' }}>
        <div className="flex flex-col items-center justify-center h-full gap-5 px-4">
          <div className="vfd-bezel p-1">
            <div className="vfd-panel p-8 flex flex-col items-center gap-4">
              <AlertTriangle className="h-10 w-10 vfd-glow-amber vfd-breathe" />
              <div className="font-mono text-sm uppercase tracking-[0.25em] vfd-glow-amber text-center">
                Ring Token Expired
              </div>
              <div className="vfd-rule w-full" />
              <p className="font-mono text-xs vfd-dim text-center max-w-sm leading-relaxed">
                Go to <a href="/security/settings" className="vfd-glow hover:opacity-80 transition-opacity">Settings</a> to refresh your Ring authentication token.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ringInit && ringDevices.length === 0) {
    return (
      <div className="h-full-no-header relative" style={{ background: 'var(--vfd-bg)' }}>
        <div className="flex items-center justify-center h-full px-4">
          <span className="font-mono text-sm uppercase tracking-[0.3em] vfd-glow vfd-breathe">
            {ringError ? `Error: ${ringError}` : 'Initializing...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full-no-header relative overflow-hidden" style={{ background: 'var(--vfd-bg)' }}>
      <div className="h-full flex justify-center px-3 py-2">
        <div className="w-full max-w-6xl h-full flex flex-col">

          {/* ═══ ZONE 1: Alarm Status — hero display band ═══ */}
          <div className="flex-shrink-0 vfd-stagger vfd-stagger-1">
            <AlarmStatusPanel mode={alarmMode} onModeChange={handleModeChange} />
          </div>

          <div className="vfd-rule-fade flex-shrink-0 my-1" />

          {/* ═══ ZONE 2: Perimeter sensors — horizontal band ═══ */}
          <div className="flex-shrink-0 vfd-stagger vfd-stagger-2">
            <DoorSensorGrid devices={contactSensors} />
          </div>

          <div className="vfd-rule-fade flex-shrink-0 my-1" />

          {/* ═══ ZONE 3: Cameras + System Health + Event Log — fills remaining space ═══ */}
          <div className="flex-1 min-h-0 flex gap-px vfd-stagger vfd-stagger-3" style={{ borderTop: '1px solid var(--vfd-border)' }}>

            {/* Left column: Cameras */}
            <div className="w-1/4 min-h-0 flex flex-col" style={{ borderRight: '1px solid var(--vfd-border)' }}>
              <CameraCard devices={cameras} />
            </div>

            {/* Center column: System Health */}
            <div className="w-2/5 min-h-0 flex flex-col" style={{ borderRight: '1px solid var(--vfd-border)' }}>
              <DeviceHealthGrid devices={visibleDevices} />
            </div>

            {/* Right column: Event Log */}
            <div className="flex-1 min-h-0 flex flex-col">
              <EventTimeline events={events} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SecurityDashboard.displayName = 'SecurityDashboard';

export default SecurityDashboard;
