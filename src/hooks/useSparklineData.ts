import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_FILTERED_SENSOR_READINGS } from '~/graphql/SensorReading';
import { aggregateHourly, calculateTrend, type TrendDirection } from '~/utils/sparklineAggregator';
import type { SensorReading } from '~/types/sensors';
import { useAdaptivePollInterval } from './useAdaptivePollInterval';

interface SparklineDataResult {
  co2Data: number[];
  temperatureData: number[];
  humidityData: number[];
  co2Trend: TrendDirection;
  temperatureTrend: TrendDirection;
  humidityTrend: TrendDirection;
  loading: boolean;
  error: Error | undefined;
}

interface GetFilteredSensorReadingsBasicData {
  filteredSensorReadings: SensorReading[];
}

/**
 * Fetches last 24 hours of sensor data and aggregates it for sparkline display.
 * Returns hourly-averaged data points for all three metrics.
 */
export function useSparklineData(sensorId: string | undefined): SparklineDataResult {
  const pollInterval = useAdaptivePollInterval(120_000, 60_000);

  // Calculate 24 hours ago
  const startDate = useMemo(() => {
    const date = new Date();
    date.setHours(date.getHours() - 24);
    return date.toISOString();
  }, []);

  const { data, loading, error } = useQuery<GetFilteredSensorReadingsBasicData>(
    GET_FILTERED_SENSOR_READINGS,
    {
      variables: {
        input: {
          sensorIds: sensorId ? [sensorId] : undefined,
          startDate,
          limit: 200, // ~144 readings at 10-min intervals for 24h
        },
      },
      skip: !sensorId,
      fetchPolicy: 'cache-first',
      pollInterval,
    }
  );

  const result = useMemo(() => {
    const readings = data?.filteredSensorReadings ?? [];

    const co2Data = aggregateHourly(readings, 'co2');
    const temperatureData = aggregateHourly(readings, 'temperature');
    const humidityData = aggregateHourly(readings, 'humidity');

    return {
      co2Data,
      temperatureData,
      humidityData,
      co2Trend: calculateTrend(co2Data),
      temperatureTrend: calculateTrend(temperatureData),
      humidityTrend: calculateTrend(humidityData),
    };
  }, [data]);

  return {
    ...result,
    loading: loading && !data,
    error: error as Error | undefined,
  };
}
