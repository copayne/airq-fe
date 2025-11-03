import { useQuery } from '@apollo/client';
import { GET_CO2_READINGS, GET_TEMPERATURE_READINGS, GET_HUMIDITY_READINGS } from '~/graphql/Measurements';
import type {
  CO2Reading,
  TemperatureReading,
  HumidityReading,
} from '~/types/sensors';
import { DEFAULT_QUERY_OPTIONS } from '~/lib/apolloDefaults';

type CO2ReadingsData = { co2Readings: CO2Reading[] };
type TemperatureReadingsData = { temperatureReadings: TemperatureReading[] };
type HumidityReadingsData = { humidityReadings: HumidityReading[] };

/**
 * Hook for fetching CO2 measurements
 * Consolidates the original useCO2Readings hook with shared configuration
 */
export function useCO2Measurements() {
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

/**
 * Hook for fetching temperature measurements
 * Consolidates the original useTemperatureReadings hook with shared configuration
 */
export function useTemperatureMeasurements() {
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

/**
 * Hook for fetching humidity measurements
 * Consolidates the original useHumidityReadings hook with shared configuration
 */
export function useHumidityMeasurements() {
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
