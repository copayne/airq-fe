import { useQuery } from '@apollo/client';
import { GET_SENSOR_LOCATIONS } from '~/graphql/SensorLocation';

interface SensorLocation {
  id: string;
  sensorId: number;
  locationId: number;
  startTime: string;
  endTime?: string;
  isCurrent: boolean;
  sensor: {
    id: string;
    name: string;
    model: string;
    isActive: boolean;
    installationDate: string;
  };
  location: {
    id: string;
    name: string;
    description?: string;
  };
}

interface SensorLocationsData {
  sensorLocations: SensorLocation[];
}

export function useSensorLocations() {
  const { data, loading, error, refetch } = useQuery<SensorLocationsData>(GET_SENSOR_LOCATIONS, {
    errorPolicy: 'all', // Return partial data with errors
    notifyOnNetworkStatusChange: true,
  });

  return {
    sensorLocations: data?.sensorLocations ?? [],
    loading,
    error,
    refetch,
  };
}