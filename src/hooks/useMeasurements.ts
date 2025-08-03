import { useQuery } from '@apollo/client';
import { GET_CO2_READINGS, GET_TEMPERATURE_READINGS, GET_HUMIDITY_READINGS } from '~/graphql/Measurements';

interface CO2Reading {
  id: string;
  readingId: number;
  co2Ppm: number;
}

interface TemperatureReading {
  id: string;
  readingId: number;
  temperatureCelsius: number;
}

interface HumidityReading {
  id: string;
  readingId: number;
  humidityPercentage: number;
}

interface CO2ReadingsData {
  co2Readings: CO2Reading[];
}

interface TemperatureReadingsData {
  temperatureReadings: TemperatureReading[];
}

interface HumidityReadingsData {
  humidityReadings: HumidityReading[];
}

export function useCO2Readings() {
  const { data, loading, error, refetch } = useQuery<CO2ReadingsData>(GET_CO2_READINGS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
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
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
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
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    humidityReadings: data?.humidityReadings ?? [],
    loading,
    error,
    refetch,
  };
}