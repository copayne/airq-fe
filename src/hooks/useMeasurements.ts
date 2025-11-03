import { useQuery } from '@apollo/client';
import { GET_CO2_READINGS, GET_TEMPERATURE_READINGS, GET_HUMIDITY_READINGS } from '~/graphql/Measurements';
import type {
  CO2ReadingsData,
  TemperatureReadingsData,
  HumidityReadingsData
} from '~/types/sensors';
import { DEFAULT_QUERY_OPTIONS } from '~/lib/apolloDefaults';

export function useCO2Readings() {
  const { data, loading, error, refetch } = useQuery<CO2ReadingsData>(GET_CO2_READINGS, {
    ...DEFAULT_QUERY_OPTIONS,
  });

  return {
    co2Readings: data?.co2Readings ?? [],
    loading,
    error,
    refetch,
  };
}

export function useTemperatureReadings() {
  const { data, loading, error, refetch } = useQuery<TemperatureReadingsData>(GET_TEMPERATURE_READINGS, {
    ...DEFAULT_QUERY_OPTIONS,
  });

  return {
    temperatureReadings: data?.temperatureReadings ?? [],
    loading,
    error,
    refetch,
  };
}

export function useHumidityReadings() {
  const { data, loading, error, refetch } = useQuery<HumidityReadingsData>(GET_HUMIDITY_READINGS, {
    ...DEFAULT_QUERY_OPTIONS,
  });

  return {
    humidityReadings: data?.humidityReadings ?? [],
    loading,
    error,
    refetch,
  };
}