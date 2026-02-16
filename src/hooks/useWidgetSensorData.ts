/**
 * Hook for fetching sensor data based on widget-specific configuration.
 * Each widget can have its own time range, sensor filters, and location filters.
 */

import { useQuery } from '@apollo/client';
import { useMemo, useState, useEffect } from 'react';
import { GET_FILTERED_SENSOR_READINGS } from '../graphql/SensorReading';
import { getDateRangeFromPreset, type TimeRangePreset } from '~/types/widgetConfig';
import type { GetFilteredSensorReadingsData } from '~/types/sensors';
import { useAdaptivePollInterval } from './useAdaptivePollInterval';

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
  const pollInterval = useAdaptivePollInterval(120_000, 60_000);

  // Time-based state that updates on each poll interval to ensure relative time ranges
  // (e.g., "last 6 hours") are recalculated with fresh timestamps
  const [timeRefreshKey, setTimeRefreshKey] = useState(0);

  useEffect(() => {
    // Only set up interval for relative time ranges (not 'all' or 'custom')
    if (!config?.timeRange || config.timeRange === 'all' || config.timeRange === 'custom') {
      return;
    }

    const intervalId = setInterval(() => {
      setTimeRefreshKey(prev => prev + 1);
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [config?.timeRange, pollInterval]);

  // Build query variables - recalculated when config changes OR time passes
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timeRefreshKey intentionally triggers recalculation
  }, [
    config?.timeRange,
    config?.customStartDate,
    config?.customEndDate,
    sensorIdsKey,
    locationIdsKey,
    timeRefreshKey, // Triggers recalculation of relative time ranges on each poll interval
  ]);

  // Use regular useQuery with network-only to always fetch fresh data
  // This ensures config changes always trigger a new fetch
  const { data, loading, error, refetch } = useQuery<GetFilteredSensorReadingsData>(
    GET_FILTERED_SENSOR_READINGS,
    {
      variables,
      skip,
      fetchPolicy: 'network-only', // Always fetch fresh data
      pollInterval,
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
