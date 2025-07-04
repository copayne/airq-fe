import { useQuery, type QueryResult } from '@apollo/client';
import { useMemo } from 'react';
import { GET_SENSORS, GET_SENSORS_BASIC } from '../graphql/Sensor';
import { type Sensor } from './useSensorData';

interface GetSensorsData {
  sensors: Sensor[];
}

interface UseSensorDataOptions {
  includeLastReading?: boolean;
  pollInterval?: number;
  fetchPolicy?: 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only';
}

export const useSensorDataOptimized = (options: UseSensorDataOptions = {}) => {
  const {
    includeLastReading = true,
    pollInterval = 0, // No polling by default
    fetchPolicy = 'cache-first',
  } = options;

  // Choose the appropriate query based on requirements
  const query = includeLastReading ? GET_SENSORS : GET_SENSORS_BASIC;
  
  const queryVariables = useMemo(() => {
    if (includeLastReading) {
      return { includeLastReading: true };
    }
    return undefined;
  }, [includeLastReading]);

  const {
    loading,
    error,
    data,
    refetch,
  }: QueryResult<GetSensorsData> = useQuery(query, {
    variables: queryVariables,
    fetchPolicy,
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all', // Show partial data on errors
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