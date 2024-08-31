import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { GET_FILTERED_SENSOR_READINGS } from '../graphql/SensorReading';
import { useSensorDataContext, SensorDataCriteria } from '../context/SensorDataContext';
import { useDebouncedRefetch } from './useDebouncedRefetch';

interface SensorReading {
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
}

export const useSensorData = () => {
  const { state, updateCriteria } = useSensorDataContext();
  const { criteria } = state;

  const queryVariables = useMemo(() => ({
    input: {
      startDate: criteria.startDate,
      endDate: criteria.endDate,
      minCo2Ppm: criteria.minCO2,
      maxCo2Ppm: criteria.maxCO2,
      minTemperatureCelsius: criteria.minTemperature,
      maxTemperatureCelsius: criteria.maxTemperature,
      minHumidityPercentage: criteria.minHumidity,
      maxHumidityPercentage: criteria.maxHumidity,
      sensorIds: criteria.sensorIds,
      locationIds: criteria.locationIds,
    }
  }), [criteria]);

  const { loading, error, data, refetch } = useQuery(GET_FILTERED_SENSOR_READINGS, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const triggerRefetch = useDebouncedRefetch(refetch, 300);

  const updateCriteriaAndRefetch = useCallback((updates: Partial<SensorDataCriteria>) => {
    updateCriteria(updates);
    triggerRefetch();
  }, [updateCriteria, triggerRefetch]);

  return useMemo(() => ({
    loading,
    error,
    sensorReadings: data?.filteredSensorReadings as SensorReading[] | undefined,
    refetch: triggerRefetch,
    criteria,
    updateCriteria: updateCriteriaAndRefetch,
  }), [loading, error, data, triggerRefetch, criteria, updateCriteriaAndRefetch]);
};