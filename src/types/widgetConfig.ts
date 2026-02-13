/**
 * Widget Configuration Types
 *
 * Type definitions for widget-specific configuration options.
 * These configs are stored as part of the dashboard layout and persist across sessions.
 */

// Time range presets for chart widgets
export type TimeRangePreset = '1h' | '6h' | '12h' | '24h' | '7d' | '30d' | '90d' | 'all' | 'custom';

// Base configuration shared by most widgets
export interface BaseWidgetConfig {
  sensorIds?: string[];
  locationIds?: string[];
}

// Chart widget configuration
export interface ChartWidgetConfig extends BaseWidgetConfig {
  timeRange: TimeRangePreset;
  customStartDate?: string; // ISO date string, used when timeRange is 'custom'
  customEndDate?: string;   // ISO date string, used when timeRange is 'custom'
  showLegend?: boolean;
  showGrid?: boolean;
}

// Multi-metric chart specific configuration
export interface MultiMetricChartConfig extends ChartWidgetConfig {
  metrics: ('co2' | 'temperature' | 'humidity')[];
}

// Air quality distribution configuration
export interface AirQualityDistributionConfig extends BaseWidgetConfig {
  periods: ('24h' | '30d' | 'allTime')[];
  layout: 'horizontal' | 'vertical';
}

// Air quality heatmap configuration
export interface AirQualityHeatmapConfig extends BaseWidgetConfig {
  days: number; // Number of days to show (default 548)
}

// Table widget configuration
export interface TableWidgetConfig extends BaseWidgetConfig {
  timeRange: TimeRangePreset;
  customStartDate?: string;
  customEndDate?: string;
  pageSize: number;
  columns: ('time' | 'co2' | 'temperature' | 'humidity' | 'location' | 'sensor')[];
  defaultSort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  temperatureUnit: 'celsius' | 'fahrenheit';
}

// Metrics card configuration
export interface MetricsCardConfig extends BaseWidgetConfig {
  temperatureUnit: 'celsius' | 'fahrenheit';
}

// Sensor comparison configuration
export interface SensorComparisonConfig extends BaseWidgetConfig {
  timeRange: TimeRangePreset;
  customStartDate?: string;
  customEndDate?: string;
  metric: 'co2' | 'temperature' | 'humidity';
  showLegend: boolean;
}

// Union type for all widget configs
export type WidgetConfig =
  | ChartWidgetConfig
  | MultiMetricChartConfig
  | AirQualityDistributionConfig
  | AirQualityHeatmapConfig
  | TableWidgetConfig
  | MetricsCardConfig
  | SensorComparisonConfig;

// Default configurations for each widget type
export const DEFAULT_MULTI_METRIC_CONFIG: MultiMetricChartConfig = {
  timeRange: '24h',
  metrics: ['co2', 'temperature'],
  showLegend: true,
  showGrid: true,
};

export const DEFAULT_AIR_QUALITY_DISTRIBUTION_CONFIG: AirQualityDistributionConfig = {
  periods: ['24h', '30d', 'allTime'],
  layout: 'vertical',
};

export const DEFAULT_AIR_QUALITY_HEATMAP_CONFIG: AirQualityHeatmapConfig = {
  days: 548,
};

export const DEFAULT_TABLE_CONFIG: TableWidgetConfig = {
  timeRange: '24h',
  pageSize: 25,
  columns: ['time', 'co2', 'temperature', 'humidity', 'location'],
  temperatureUnit: 'fahrenheit',
};

export const DEFAULT_METRICS_CARD_CONFIG: MetricsCardConfig = {
  temperatureUnit: 'fahrenheit',
};

export const DEFAULT_SENSOR_COMPARISON_CONFIG: SensorComparisonConfig = {
  timeRange: '24h',
  metric: 'co2',
  showLegend: true,
};

// Helper to get default config for a widget type
export function getDefaultWidgetConfig(widgetType: string): Record<string, unknown> {
  switch (widgetType) {
    case 'MULTI_METRIC_CHART':
      return { ...DEFAULT_MULTI_METRIC_CONFIG };
    case 'AIR_QUALITY_DISTRIBUTION':
      return { ...DEFAULT_AIR_QUALITY_DISTRIBUTION_CONFIG };
    case 'AIR_QUALITY_HEATMAP':
      return { ...DEFAULT_AIR_QUALITY_HEATMAP_CONFIG };
    case 'TABLE':
      return { ...DEFAULT_TABLE_CONFIG };
    case 'METRICS_CARD':
      return { ...DEFAULT_METRICS_CARD_CONFIG };
    case 'SENSOR_COMPARISON':
      return { ...DEFAULT_SENSOR_COMPARISON_CONFIG };
    default:
      return {};
  }
}

// Time range preset labels for UI
export const TIME_RANGE_LABELS: Record<TimeRangePreset, string> = {
  '1h': 'Last Hour',
  '6h': 'Last 6 Hours',
  '12h': 'Last 12 Hours',
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  'all': 'All Time',
  'custom': 'Custom Range',
};

// Helper to calculate date range from preset
export function getDateRangeFromPreset(preset: TimeRangePreset): { startDate: Date; endDate: Date } | null {
  if (preset === 'custom' || preset === 'all') {
    return null;
  }

  const now = new Date();
  const endDate = now;
  let startDate: Date;

  switch (preset) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '6h':
      startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      break;
    case '12h':
      startDate = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      break;
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return { startDate, endDate };
}
