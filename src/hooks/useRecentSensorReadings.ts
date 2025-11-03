import { useQuery } from '@apollo/client';
import { GET_SENSOR_READINGS } from '~/graphql/SensorReading';
import type { RecentSensorReadingsData } from '~/types/sensors';
import { CACHE_AND_NETWORK_OPTIONS } from '~/lib/apolloDefaults';

export function useRecentSensorReadings() {
  const { data, loading, error, refetch } = useQuery<RecentSensorReadingsData>(GET_SENSOR_READINGS, {
    ...CACHE_AND_NETWORK_OPTIONS,
  });

  return {
    sensorReadings: data?.sensorReadings ?? [],
    loading,
    error,
    refetch,
  };
}