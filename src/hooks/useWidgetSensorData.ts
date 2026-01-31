/**
 * Hook for fetching sensor data based on widget-specific configuration.
 * Each widget can have its own time range, sensor filters, and location filters.
 */

import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_FILTERED_SENSOR_READINGS } from '../graphql/SensorReading';
import { getDateRangeFromPreset, type TimeRangePreset } from '~/types/widgetConfig';
import type { GetFilteredSensorReadingsData } from '~/types/sensors';
import { env } from '~/env.js';

interface WidgetConfig {
  timeRange?: TimeRangePreset;
  customStartDate?: string;
  customEndDate?: string;
  sensorIds?: string[];
  locationIds?: string[];
}

interface UseWidgetSensorDataOptions {
  config?: WidgetConfig;
  skip?: boolean;
}

// Default limit for chart widgets - prevents extremely large result sets
const DEFAULT_WIDGET_LIMIT = 5000;

export const useWidgetSensorData = ({ config, skip = false }: UseWidgetSensorDataOptions) => {
  // Serialize arrays to strings for stable dependency comparison
  const sensorIdsKey = config?.sensorIds?.join(',') ?? '';
  const locationIdsKey = config?.locationIds?.join(',') ?? '';

  // Build query variables - recalculated when config changes
  const variables = useMemo(() => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (config?.timeRange && config.timeRange !== 'all') {
      if (config.timeRange === 'custom') {
        startDate = config.customStartDate;
        endDate = config.customEndDate;
      } else {
        // For relative time ranges, calculate fresh dates NOW
        const range = getDateRangeFromPreset(config.timeRange);
        if (range) {
          startDate = range.startDate.toISOString();
          endDate = range.endDate.toISOString();
        }
      }
    }

    // Parse the serialized keys back to arrays
    const sensorIds = sensorIdsKey ? sensorIdsKey.split(',') : undefined;
    const locationIds = locationIdsKey ? locationIdsKey.split(',') : undefined;

    return {
      input: {
        startDate,
        endDate,
        sensorIds: sensorIds?.length ? sensorIds : undefined,
        locationIds: locationIds?.length ? locationIds : undefined,
        limit: DEFAULT_WIDGET_LIMIT,
      }
    };
  }, [
    config?.timeRange,
    config?.customStartDate,
    config?.customEndDate,
    sensorIdsKey,
    locationIdsKey,
  ]);

  // Use regular useQuery with network-only to always fetch fresh data
  // This ensures config changes always trigger a new fetch
  const { data, loading, error, refetch } = useQuery<GetFilteredSensorReadingsData>(
    GET_FILTERED_SENSOR_READINGS,
    {
      variables,
      skip,
      fetchPolicy: 'network-only', // Always fetch fresh data
      pollInterval: env.NEXT_PUBLIC_POLL_INTERVAL_MS,
      notifyOnNetworkStatusChange: true,
    }
  );

  return {
    loading: loading && !data?.filteredSensorReadings,
    error,
    sensorReadings: data?.filteredSensorReadings,
    refetch,
  };
};
