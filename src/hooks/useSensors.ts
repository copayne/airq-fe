import { useQuery, type QueryResult } from '@apollo/client';
import { useMemo } from 'react';
import { GET_SENSORS, GET_SENSORS_BASIC } from '../graphql/Sensor';
import type { GetSensorsData } from '~/types/sensors';
import { DEFAULT_QUERY_OPTIONS, CACHE_AND_NETWORK_OPTIONS } from '~/lib/apolloDefaults';

export interface UseSensorsOptions {
  includeLastReading?: boolean;
  pollInterval?: number;
  fetchPolicy?: 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only';
}

/**
 * Unified hook for fetching sensor data with flexible options
 * Replaces both useSensorData and useSensorDataOptimized
 *
 * @param options Configuration options for the query
 * @param options.includeLastReading Whether to include the last sensor reading (default: true)
 * @param options.pollInterval Polling interval in milliseconds (default: 0 - no polling)
 * @param options.fetchPolicy Apollo fetch policy (default: 'cache-and-network')
 */
export const useSensors = (options: UseSensorsOptions = {}) => {
  const {
    includeLastReading = true,
    pollInterval = 0,
    fetchPolicy = 'cache-and-network',
  } = options;

  // Choose the appropriate query based on whether we need last reading data
  const query = includeLastReading ? GET_SENSORS : GET_SENSORS_BASIC;

  const queryVariables = useMemo(() => {
    if (includeLastReading) {
      return { includeLastReading: true };
    }
    return undefined;
  }, [includeLastReading]);

  // Use appropriate default options based on fetch policy
  const baseOptions = fetchPolicy === 'cache-and-network'
    ? CACHE_AND_NETWORK_OPTIONS
    : DEFAULT_QUERY_OPTIONS;

  const {
    loading,
    error,
    data,
    refetch,
  }: QueryResult<GetSensorsData> = useQuery(query, {
    variables: queryVariables,
    ...baseOptions,
    fetchPolicy,
    pollInterval,
  });

  return useMemo(() => ({
    loading,
    error,
    sensors: data?.sensors,
    refetch,
  }), [
    loading,
    error,
    data?.sensors,
    refetch,
  ]);
};
