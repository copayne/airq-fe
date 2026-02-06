/**
 * Widget Registry
 *
 * Central configuration for all dashboard widgets including metadata
 * and default dimensions for each responsive breakpoint.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  Bell,
  Camera,
  DoorOpen,
  Droplets,
  Gauge,
  Grid3X3,
  LineChart,
  Table,
  Thermometer,
  Calendar,
  GitCompareArrows,
  TrendingUp,
  Zap,
} from 'lucide-react';

export type WidgetCategory = 'air-quality' | 'ring' | 'data' | 'actions';

export interface WidgetDefaultLayout {
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetDefinition {
  id: string;
  name: string;
  category: WidgetCategory;
  icon: LucideIcon;
  description: string;
  defaultLayouts: {
    lg: WidgetDefaultLayout;
    md: WidgetDefaultLayout;
    sm: WidgetDefaultLayout;
  };
}

export interface WidgetCategoryInfo {
  id: WidgetCategory;
  name: string;
  icon: LucideIcon;
}

export const WIDGET_CATEGORIES: WidgetCategoryInfo[] = [
  { id: 'air-quality', name: 'Air Quality', icon: Activity },
  { id: 'ring', name: 'Ring Integration', icon: Bell },
  { id: 'data', name: 'Data', icon: Table },
  { id: 'actions', name: 'Actions', icon: Zap },
];

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  // Air Quality Widgets
  // Optimized for tablet (8" Galaxy Tab A): reduced heights, lower minimums
  {
    id: 'TEMPERATURE_CHART',
    name: 'Temperature Chart',
    category: 'air-quality',
    icon: Thermometer,
    description: 'Temperature trends over time',
    defaultLayouts: {
      lg: { w: 8, h: 5, minW: 5, minH: 3 },
      md: { w: 8, h: 4, minW: 5, minH: 3 },
      sm: { w: 12, h: 4, minW: 6, minH: 3 },
    },
  },
  {
    id: 'CO2_CHART',
    name: 'CO2 Chart',
    category: 'air-quality',
    icon: LineChart,
    description: 'CO2 levels over time',
    defaultLayouts: {
      lg: { w: 8, h: 5, minW: 5, minH: 3 },
      md: { w: 8, h: 4, minW: 5, minH: 3 },
      sm: { w: 12, h: 4, minW: 6, minH: 3 },
    },
  },
  {
    id: 'MULTI_METRIC_CHART',
    name: 'Multi-Metric Chart',
    category: 'air-quality',
    icon: BarChart3,
    description: 'CO2 and temperature on dual axes',
    defaultLayouts: {
      lg: { w: 12, h: 5, minW: 6, minH: 3 },
      md: { w: 16, h: 5, minW: 6, minH: 3 },
      sm: { w: 12, h: 5, minW: 8, minH: 3 },
    },
  },
  {
    id: 'HUMIDITY_CHART',
    name: 'Humidity Chart',
    category: 'air-quality',
    icon: Droplets,
    description: 'Humidity levels over time',
    defaultLayouts: {
      lg: { w: 8, h: 5, minW: 5, minH: 3 },
      md: { w: 8, h: 4, minW: 5, minH: 3 },
      sm: { w: 12, h: 4, minW: 6, minH: 3 },
    },
  },
  {
    id: 'AIR_QUALITY_DISTRIBUTION',
    name: 'Air Quality Distribution',
    category: 'air-quality',
    icon: Grid3X3,
    description: 'Distribution charts for 24h, 30d, all-time',
    defaultLayouts: {
      lg: { w: 10, h: 5, minW: 5, minH: 1 },
      md: { w: 10, h: 4, minW: 5, minH: 1 },
      sm: { w: 12, h: 4, minW: 8, minH: 1  },
    },
  },
  {
    id: 'AIR_QUALITY_HEATMAP',
    name: 'Air Quality Heatmap',
    category: 'air-quality',
    icon: Calendar,
    description: 'Calendar heatmap of daily air quality',
    defaultLayouts: {
      lg: { w: 12, h: 5, minW: 8, minH: 4 },
      md: { w: 16, h: 5, minW: 8, minH: 4 },
      sm: { w: 12, h: 5, minW: 10, minH: 4 },
    },
  },

  {
    id: 'HISTORICAL_TRENDS',
    name: 'Historical Trends',
    category: 'air-quality',
    icon: TrendingUp,
    description: 'Daily/weekly averaged trends over long periods',
    defaultLayouts: {
      lg: { w: 10, h: 5, minW: 6, minH: 3 },
      md: { w: 12, h: 5, minW: 6, minH: 3 },
      sm: { w: 12, h: 4, minW: 8, minH: 3 },
    },
  },
  {
    id: 'SENSOR_COMPARISON',
    name: 'Sensor Comparison',
    category: 'air-quality',
    icon: GitCompareArrows,
    description: 'Compare metrics across multiple sensors',
    defaultLayouts: {
      lg: { w: 10, h: 5, minW: 6, minH: 3 },
      md: { w: 12, h: 5, minW: 6, minH: 3 },
      sm: { w: 12, h: 4, minW: 8, minH: 3 },
    },
  },

  // Ring Integration Widgets
  {
    id: 'RING_SNAPSHOT',
    name: 'Camera Snapshot',
    category: 'ring',
    icon: Camera,
    description: 'Ring doorbell camera snapshot',
    defaultLayouts: {
      lg: { w: 6, h: 5, minW: 4, minH: 3 },
      md: { w: 8, h: 4, minW: 4, minH: 3 },
      sm: { w: 12, h: 4, minW: 6, minH: 3 },
    },
  },
  {
    id: 'RING_CONTACT_SENSORS',
    name: 'Door Sensors',
    category: 'ring',
    icon: DoorOpen,
    description: 'Door and window contact sensor status',
    defaultLayouts: {
      lg: { w: 6, h: 4, minW: 3, minH: 2 },
      md: { w: 8, h: 3, minW: 3, minH: 2 },
      sm: { w: 12, h: 3, minW: 6, minH: 2 },
    },
  },
  {
    id: 'RING_STATUS',
    name: 'Ring Status',
    category: 'ring',
    icon: Bell,
    description: 'Combined camera and sensor status',
    defaultLayouts: {
      lg: { w: 8, h: 5, minW: 5, minH: 3 },
      md: { w: 10, h: 4, minW: 5, minH: 3 },
      sm: { w: 12, h: 4, minW: 8, minH: 3 },
    },
  },
  {
    id: 'RING_EVENTS',
    name: 'Ring Events',
    category: 'ring',
    icon: Bell,
    description: 'Timeline of recent Ring events',
    defaultLayouts: {
      lg: { w: 6, h: 5, minW: 4, minH: 3 },
      md: { w: 8, h: 4, minW: 4, minH: 3 },
      sm: { w: 12, h: 4, minW: 6, minH: 3 },
    },
  },

  // Data Widgets
  {
    id: 'TABLE',
    name: 'Sensor Readings Table',
    category: 'data',
    icon: Table,
    description: 'Tabular view of sensor readings',
    defaultLayouts: {
      lg: { w: 12, h: 5, minW: 6, minH: 3 },
      md: { w: 16, h: 5, minW: 6, minH: 3 },
      sm: { w: 12, h: 5, minW: 8, minH: 3 },
    },
  },
  {
    id: 'METRICS_CARD',
    name: 'Metrics Card',
    category: 'data',
    icon: Gauge,
    description: 'Aggregated metrics display',
    defaultLayouts: {
      lg: { w: 6, h: 3, minW: 3, minH: 2 },
      md: { w: 8, h: 2, minW: 3, minH: 2 },
      sm: { w: 12, h: 2, minW: 6, minH: 2 },
    },
  },

  // Action Widgets
  {
    id: 'QUICK_ACTIONS',
    name: 'Quick Actions',
    category: 'actions',
    icon: Zap,
    description: 'Quick action buttons',
    defaultLayouts: {
      lg: { w: 4, h: 2, minW: 2, minH: 2 },
      md: { w: 5, h: 2, minW: 2, minH: 2 },
      sm: { w: 6, h: 2, minW: 4, minH: 2 },
    },
  },
];

/**
 * Get a widget definition by ID
 */
export function getWidgetDefinition(id: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY.find((w) => w.id === id);
}

/**
 * Get all widgets for a specific category
 */
export function getWidgetsByCategory(category: WidgetCategory): WidgetDefinition[] {
  return WIDGET_REGISTRY.filter((w) => w.category === category);
}

/**
 * Get widgets grouped by category
 */
export function getWidgetsGroupedByCategory(): Map<WidgetCategory, WidgetDefinition[]> {
  const grouped = new Map<WidgetCategory, WidgetDefinition[]>();

  for (const category of WIDGET_CATEGORIES) {
    grouped.set(category.id, getWidgetsByCategory(category.id));
  }

  return grouped;
}
