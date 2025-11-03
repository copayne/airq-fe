import { GET_SENSOR_LOCATIONS } from '~/graphql/SensorLocation';
import { useQueryList } from './useQueryList';

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

export function useSensorLocations() {
  const { data: sensorLocations, loading, error, refetch } = useQueryList<SensorLocation>(
    GET_SENSOR_LOCATIONS,
    'sensorLocations'
  );

  return {
    sensorLocations,
    loading,
    error,
    refetch,
  };
}