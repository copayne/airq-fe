/**
 * Dashboard Layout Types
 *
 * Types for managing saved dashboard layouts, widget configurations,
 * and per-widget criteria.
 */

export interface DashboardLayout {
  id: string;
  name: string;
  layoutData: string; // JSON string from API, must be parsed to DashboardLayoutData
  isLastUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardLayoutData {
  version: number;
  widgets: WidgetState[];
  config?: object;
  gridBreakpoint?: string;
}

export interface WidgetState {
  instanceId: string;
  type: string;
  layout: {
    lg?: GridItemLayout;
    md?: GridItemLayout;
    sm?: GridItemLayout;
  };
  criteria?: WidgetCriteria;
  config?: Record<string, unknown>;
  props?: Record<string, unknown>;
}

export interface GridItemLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetCriteria {
  filters?: Record<string, FilterValue>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
  [key: string]: unknown;
}

export type FilterValue = string | number | boolean | Date | Array<string | number>;

// API Response Types

export interface DashboardLayoutMutationResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  layout?: DashboardLayout;
}

export interface CreateDashboardLayoutInput {
  name: string;
  layoutData: string; // JSON string
}

export interface UpdateDashboardLayoutInput {
  id: string;
  name?: string;
  layoutData?: string; // JSON string
}

