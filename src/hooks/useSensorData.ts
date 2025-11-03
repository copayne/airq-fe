import { useQuery, type QueryResult } from '@apollo/client';
import { useMemo } from 'react';
import { GET_SENSORS } from '../graphql/Sensor';
import type { GetSensorsData } from '~/types/sensors';
import { CACHE_AND_NETWORK_OPTIONS } from '~/lib/apolloDefaults';

export const useSensorData = () => {
  const {
    loading,
    error,
    data,
  }: QueryResult<GetSensorsData> = useQuery(GET_SENSORS, {
    variables: {
      includeLastReading: true, // Can be made configurable
    },
    ...CACHE_AND_NETWORK_OPTIONS,
  });

  return useMemo(() => ({
    loading,
    error,
    sensors: data?.sensors,
  }), [
    loading,
    error,
    data,
  ]);
};