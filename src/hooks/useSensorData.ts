import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_SENSORS } from '../graphql/Sensor';

export interface Sensor {
  id: string;
  model: string;
  name: string;
  installationDate: Date;
  isActive: boolean;
  currentLocation: {
    id: string;
    name: string;
  }
  lastReading: {
    id: string;
    readingTime: string;
    sensor: {
      id: string;
      name: string;
    };
    location: {
      id: string;
      name: string;
    };
    co2Reading: {
      co2Ppm: number;
    };
    temperatureReading: {
      temperatureCelsius: number;
    };
    humidityReading: {
      humidityPercentage: number;
    };
    isSuccess: boolean;
  }

}

export const useSensorData = () => {
  const {
    loading,
    error,
    data,
  } = useQuery(GET_SENSORS, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  return useMemo(() => ({
    loading,
    error,
    sensors: data?.sensors as Sensor[] | undefined,
  }), [
    loading,
    error,
    data,
  ]);
};