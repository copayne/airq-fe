import React, { memo, useRef, useEffect } from 'react';
import type { SecurityEvent } from '~/context/SecurityContext';
import { getRelativeTime } from '~/utils/dateUtils';

interface EventTimelineProps {
  events: SecurityEvent[];
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return { text: 'vfd-glow-red', dot: 'vfd-dot-red' };
    case 'warning': return { text: 'vfd-glow-amber', dot: 'vfd-dot-amber' };
    default: return { text: 'vfd-dim', dot: 'vfd-dot-on' };
  }
}

const EventTimeline: React.FC<EventTimelineProps> = memo(({ events }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="h-full vfd-panel px-3 py-2">
        <div className="relative z-[2]">
          <span className="vfd-label">LOG</span>
          <p className="font-mono text-[10px] vfd-ghost mt-2">No events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full vfd-panel px-3 py-2 flex flex-col">
      <div className="relative z-[2] flex flex-col h-full">
        {/* Zone label */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <span className="vfd-label">LOG</span>
          <span className="font-mono text-[9px] tracking-[0.15em] vfd-ghost">
            {events.length}
          </span>
        </div>

        {/* Event list */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-0">
          {events.map((event, index) => {
            const { text, dot } = getSeverityColor(event.severity);
            const isLast = index === events.length - 1;

            return (
              <div key={event.id} className="flex gap-2">
                {/* Timeline spine */}
                <div className="flex flex-col items-center w-2 flex-shrink-0">
                  <div className={`vfd-dot ${dot} mt-1.5`} style={{ width: '3px', height: '3px' }} />
                  {!isLast && (
                    <div className="w-px flex-1 mt-0.5" style={{ background: 'var(--vfd-hairline)' }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-2 flex-1 min-w-0">
                  <span className={`font-mono text-[10px] tracking-[0.02em] leading-tight block ${text}`}>
                    {event.message ?? event.eventType}
                  </span>
                  <span className="font-mono text-[9px] tracking-wider vfd-ghost mt-0.5 block">
                    {getRelativeTime(event.createdAt, '--:--')}
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

EventTimeline.displayName = 'EventTimeline';

export default EventTimeline;
