import { useQuery } from '@apollo/client';
import { GET_METRICS } from '~/graphql/Metrics';
import { env } from '~/env.js';

export interface Metrics {
  co21dayAvg: number | null;
  co230dayAvg: number | null;
  temp1dayAvg: number | null;
  temp30dayAvg: number | null;
  tempHighestAllTime: number | null;
  tempLowestAllTime: number | null;
  co2HighestAllTime: number | null;
  co2LowestAllTime: number | null;
}

interface MetricsData {
  metrics: Metrics | null;
}

export function useMetrics() {
  const { data, loading, error, refetch } = useQuery<MetricsData>(GET_METRICS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network', // Show cached data immediately, fetch fresh data in background
    pollInterval: env.NEXT_PUBLIC_POLL_INTERVAL_MS, // Poll at configured interval
  });

  return {
    metrics: data?.metrics ?? null,
    loading,
    error,
    refetch,
  };
}
