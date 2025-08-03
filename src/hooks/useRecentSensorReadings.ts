import { useQuery } from '@apollo/client';
import { GET_SENSOR_READINGS } from '~/graphql/SensorReading';

interface SensorReading {
  id: string;
  readingTime: string;
  isSuccess?: boolean;
  sensor: {
    id: string;
    name: string;
    model: string;
    isActive: boolean;
    installationDate: string;
  };
  location?: {
    id: string;
    name: string;
    description?: string;
  };
  co2Reading?: {
    co2Ppm: number;
  };
  temperatureReading?: {
    temperatureCelsius: number;
  };
  humidityReading?: {
    humidityPercentage: number;
  };
}

interface RecentSensorReadingsData {
  sensorReadings: SensorReading[];
}

export function useRecentSensorReadings() {
  const { data, loading, error, refetch } = useQuery<RecentSensorReadingsData>(GET_SENSOR_READINGS, {
    errorPolicy: 'all', // Return partial data with errors
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network', // Always fetch fresh data but use cache first
  });

  return {
    sensorReadings: data?.sensorReadings ?? [],
    loading,
    error,
    refetch,
  };
}