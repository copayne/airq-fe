import { useQuery } from '@apollo/client';
import { useEffect, useRef, useCallback } from 'react';
import { GET_UNACKNOWLEDGED_ALERT_COUNT } from '~/graphql/Alerts';
import { useAuth } from '~/context/AuthContext';

interface UseAlertsResult {
  unacknowledgedCount: number;
  loading: boolean;
  refetch: () => void;
}

export function useAlerts(pollIntervalMs = 60000): UseAlertsResult {
  const { isAuthenticated } = useAuth();
  const previousCount = useRef(0);

  const { data, loading, refetch } = useQuery<{ unacknowledgedAlertCount: number }>(
    GET_UNACKNOWLEDGED_ALERT_COUNT,
    {
      skip: !isAuthenticated,
      pollInterval: isAuthenticated ? pollIntervalMs : 0,
      fetchPolicy: 'network-only',
    }
  );

  const count = data?.unacknowledgedAlertCount ?? 0;

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
