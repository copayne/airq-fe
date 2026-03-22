import React, { memo, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

export type AlarmMode = 'away' | 'home' | 'disarmed' | 'unknown';

interface AlarmStatusPanelProps {
  mode: AlarmMode;
  onModeChange?: () => void;
}

const modeConfig: Record<AlarmMode, {
  display: string;
  sub: string;
  glowClass: string;
  dotClass: string;
  btnActiveClass: string;
  ghostText: string;
}> = {
  away: {
    display: 'ARMED',
    sub: 'AWAY',
    glowClass: 'vfd-glow-amber',
    dotClass: 'vfd-dot-amber',
    btnActiveClass: 'vfd-btn-active-amber',
    ghostText: '88888',
  },
  home: {
    display: 'ARMED',
    sub: 'HOME',
    glowClass: 'vfd-glow-amber',
    dotClass: 'vfd-dot-amber',
    btnActiveClass: 'vfd-btn-active-amber',
    ghostText: '88888',
  },
  disarmed: {
    display: 'OFF',
    sub: '',
    glowClass: 'vfd-glow-red',
    dotClass: 'vfd-dot-red',
    btnActiveClass: 'vfd-btn-active-red',
    ghostText: '888',
  },
  unknown: {
    display: '---',
    sub: '',
    glowClass: 'vfd-dim-amber',
    dotClass: 'vfd-dot-off',
    btnActiveClass: '',
    ghostText: '888',
  },
};

type AlarmAction = 'armHome' | 'armAway' | 'disarm';

const buttons: { action: AlarmAction; label: string; activeMode: AlarmMode }[] = [
  { action: 'disarm', label: 'OFF', activeMode: 'disarmed' },
  { action: 'armHome', label: 'HOME', activeMode: 'home' },
  { action: 'armAway', label: 'AWAY', activeMode: 'away' },
];

const AlarmStatusPanel: React.FC<AlarmStatusPanelProps> = memo(({ mode, onModeChange }) => {
  const c = modeConfig[mode];
  const [pending, setPending] = useState<AlarmAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = useCallback(async (action: AlarmAction) => {
    setPending(action);
    setError(null);
    try {
      const res = await fetch('/api/ring/alarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to change mode');
      } else {
        onModeChange?.();
      }
    } catch {
      setError('Network error');
    } finally {
      setPending(null);
    }
  }, [onModeChange]);

  return (
    <div className="vfd-panel px-4 py-3">
      <div className="relative z-[2] flex items-center justify-between">

        {/* Left: Large alarm display — like the "1:49" track counter on a receiver */}
        <div className="flex items-center gap-4">
          <div className={`vfd-dot ${c.dotClass} vfd-breathe`} style={{ width: '8px', height: '8px' }} />
          <div className="flex items-baseline gap-3 relative">
            {/* Ghost segments behind the display text */}
            <span
              className="vfd-display text-3xl sm:text-4xl font-bold tracking-[0.15em] absolute inset-0"
              style={{ color: 'var(--vfd-amber-ghost)' }}
              aria-hidden="true"
            >
              {c.ghostText}
            </span>
            <span className={`vfd-display text-3xl sm:text-4xl font-bold tracking-[0.15em] relative ${c.glowClass}`}>
              {c.display}
            </span>
            {c.sub && (
              <span className="vfd-display text-lg sm:text-xl font-medium tracking-[0.2em] vfd-glow-amber relative">
                {c.sub}
              </span>
            )}
          </div>
        </div>

        {/* Center: Status label */}
        <div className="hidden md:flex flex-col items-center gap-1">
          <span className="vfd-label">ALARM</span>
          <span className="font-mono text-[9px] tracking-[0.2em] vfd-ghost">STATUS</span>
        </div>

        {/* Right: Mode buttons */}
        <div className="flex items-center gap-3">
          <span className="vfd-label hidden sm:block mr-1">MODE</span>
          <div className="flex items-center gap-1">
            {buttons.map(({ action, label, activeMode }) => {
              const isActive = mode === activeMode;
              const isLoading = pending === action;
              const isDisabled = pending !== null;

              return (
                <button
                  key={action}
                  onClick={() => void handleAction(action)}
                  disabled={isDisabled || isActive}
                  className={`vfd-btn ${isActive ? c.btnActiveClass : ''}`}
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {error && (
        <div className="relative z-[2] mt-1.5 font-mono text-[10px] vfd-glow-red tracking-wider">
          {error}
        </div>
      )}
    </div>
  );
});

AlarmStatusPanel.displayName = 'AlarmStatusPanel';

export default AlarmStatusPanel;
