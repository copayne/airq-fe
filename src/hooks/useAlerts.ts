import { useQuery } from '@apollo/client';
import { useEffect, useRef, useCallback } from 'react';
import { GET_UNACKNOWLEDGED_ALERT_COUNT } from '~/graphql/Alerts';
import { useAuth } from '~/context/AuthContext';
import { useRealtime } from '~/context/RealtimeContext';

interface UseAlertsResult {
  unacknowledgedCount: number;
  loading: boolean;
  refetch: () => void;
}

const POLLING_FALLBACK_MS = 300000; // 5 minutes when WS is connected

export function useAlerts(pollIntervalMs = 60000): UseAlertsResult {
  const { isAuthenticated } = useAuth();
  const { connected, onAlert } = useRealtime();
  const previousCount = useRef(0);

  // Use longer polling interval when WebSocket is connected
  const effectivePollInterval = connected ? POLLING_FALLBACK_MS : pollIntervalMs;

  const { data, loading, refetch } = useQuery<{ unacknowledgedAlertCount: number }>(
    GET_UNACKNOWLEDGED_ALERT_COUNT,
    {
      skip: !isAuthenticated,
      pollInterval: isAuthenticated ? effectivePollInterval : 0,
      fetchPolicy: 'network-only',
    }
  );

  const count = data?.unacknowledgedAlertCount ?? 0;

  // Immediately refetch when a WebSocket alert arrives
  useEffect(() => {
    const unsubscribe = onAlert(() => {
      void refetch();
    });
    return unsubscribe;
  }, [onAlert, refetch]);

  useEffect(() => {
    if (count > previousCount.current && previousCount.current >= 0) {
      // New alerts appeared — fire browser notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const newAlerts = count - previousCount.current;
        new Notification('AirQ CO2 Alert', {
          body: `${newAlerts} new CO2 alert${newAlerts > 1 ? 's' : ''}`,
          icon: '/favicon.ico',
        });
      }
    }
    previousCount.current = count;
  }, [count]);

  const refetchAlerts = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    unacknowledgedCount: count,
    loading,
    refetch: refetchAlerts,
  };
}
