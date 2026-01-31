/**
 * Ring Events Card
 *
 * Displays recent Ring doorbell/camera events (motion, dings, etc.)
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import type { RingEvent } from '~/pages/api/ring/history';
import type { RingEventsConfig } from '~/types/widgetConfig';
import { getRelativeTime as getRelativeTimeUtil } from '~/utils/dateUtils';

interface RingEventsCardProps {
  limit?: number;
  refreshInterval?: number;
  config?: RingEventsConfig;
}

function getEventIcon(eventType: string): string {
  switch (eventType) {
    case 'Motion Detected':
      return '🚶';
    case 'Doorbell Ring':
      return '🔔';
    case 'Live View':
      return '👁️';
    case 'Door Opened':
      return '🚪';
    case 'Door Closed':
      return '🔐';
    case 'Alarm':
      return '🚨';
    case 'Armed':
      return '🛡️';
    case 'Disarmed':
      return '🔓';
    default:
      return '📹';
  }
}

function getRelativeTime(timestamp: string): string {
  return getRelativeTimeUtil(timestamp, 'Unknown');
}

const RingEventsCard: React.FC<RingEventsCardProps> = memo(({
  limit = 40,
  refreshInterval = 60000,
  config,
}) => {
  // Use config values if provided, otherwise fall back to props
  const effectiveLimit = config?.limit ?? limit;
  const effectiveRefreshInterval = config?.refreshInterval ?? refreshInterval;

  const [events, setEvents] = useState<RingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ring/history?limit=${effectiveLimit}&t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await response.json() as { success: boolean; events?: RingEvent[]; error?: string };

      if (data.success && data.events) {
        setEvents(data.events);
        setError(null);
      } else {
        setError(data.error ?? 'Failed to fetch events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [effectiveLimit]);

  useEffect(() => {
    void fetchEvents();

    if (effectiveRefreshInterval > 0) {
      const interval = setInterval(() => {
        void fetchEvents();
      }, effectiveRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchEvents, effectiveRefreshInterval]);

  if (loading && events.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-airq-light">
        <div className="animate-spin h-8 w-8 border-2 border-airq-dark border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-airq-light p-4">
        <p className="text-airq-tertiary text-sm mb-2">Error loading events</p>
        <p className="text-xs text-airq-dark/50 mb-3">{error}</p>
        <button
          onClick={() => void fetchEvents()}
          className="px-3 py-1.5 bg-airq-dark text-airq-light text-xs hover:bg-airq-dark/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-airq-light">
        <p className="text-airq-dark/50 text-sm">No recent events</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-airq-light">
      <div className="flex-1 overflow-y-auto">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`flex items-center gap-3 px-3 py-2 ${
              index !== events.length - 1 ? 'border-b border-airq-dark/10' : ''
            }`}
          >
            <span className="text-xl flex-shrink-0">{getEventIcon(event.eventType)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-airq-dark truncate">
                {event.eventType}
              </p>
              <p className="text-[10px] text-airq-dark/60 truncate">
                {event.deviceName}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-airq-dark/75">
                {getRelativeTime(event.timestamp)}
              </p>
              {event.answered !== undefined && (
                <p className="text-[9px] text-airq-dark/50">
                  {event.answered ? 'Answered' : 'Missed'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-airq-dark/10 px-3 py-1.5 flex justify-between items-center bg-airq-dark/5">
        <span className="text-[9px] text-airq-dark/50">
          {lastRefresh && `Updated ${getRelativeTime(lastRefresh.toISOString())}`}
        </span>
        <button
          onClick={() => void fetchEvents()}
          disabled={loading}
          className="text-[10px] text-airq-dark hover:text-airq-dark/70 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
});

RingEventsCard.displayName = 'RingEventsCard';

export default RingEventsCard;
