import { useQuery, type QueryResult } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { GET_FILTERED_SENSOR_READINGS } from '../graphql/SensorReading';
import { useSensorDataContext, type SensorDataCriteria } from '../context/SensorDataContext';
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

interface GetFilteredSensorReadingsData {
  filteredSensorReadings: SensorReading[];
}

export const useSensorReadingData = () => {
  const {
    state,
    updateCriteria,
    updateIsFetched,
  } = useSensorDataContext();
  const {
    criteria,
    isFetched,
  } = state;

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

  const { loading, error, data, refetch }: QueryResult<GetFilteredSensorReadingsData> = useQuery(GET_FILTERED_SENSOR_READINGS, {
    variables: queryVariables,
    fetchPolicy: 'cache-first', // More efficient caching strategy
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all', // Show partial data on errors
    pollInterval: 30000, // Poll every 30 seconds for real-time updates
    retryPolicy: {
      maxRetryAttempts: 3,
      delayMs: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 30000),
    },
  });

  if (!isFetched && !!data?.filteredSensorReadings?.length) {
    updateIsFetched(true);
  }

  const triggerRefetch = useDebouncedRefetch(() => void refetch(), 300);

  const updateCriteriaAndRefetch = useCallback((updates: Partial<SensorDataCriteria>) => {
    updateCriteria(updates);
    void triggerRefetch();
  }, [updateCriteria, triggerRefetch]);

  return useMemo(() => ({
    criteria,
    error,
    isFetched,
    loading,
    refetch: triggerRefetch,
    sensorReadings: data?.filteredSensorReadings,
    updateCriteria: updateCriteriaAndRefetch,
  }), [
    criteria,
    data,
    error,
    isFetched,
    loading,
    triggerRefetch,
    updateCriteriaAndRefetch,
  ]);
};