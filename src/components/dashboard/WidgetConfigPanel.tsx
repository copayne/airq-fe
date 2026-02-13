/**
 * Widget Configuration Panel
 *
 * A popover panel for configuring widget-specific options like time range,
 * sensor/location filters, and display settings. Configuration is saved
 * as part of the dashboard layout.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Check } from 'lucide-react';
import { useSensors } from '~/hooks/useSensors';
import { useLocations } from '~/hooks/useLocations';
import {
  TIME_RANGE_LABELS,
  type TimeRangePreset,
  getDefaultWidgetConfig,
} from '~/types/widgetConfig';

interface WidgetConfigPanelProps {
  widgetId: string;
  widgetType: string;
  config: Record<string, unknown>;
  onConfigChange: (widgetId: string, config: Record<string, unknown>) => void;
}

// Widget types that support configuration
const CONFIGURABLE_WIDGETS = [
  'MULTI_METRIC_CHART',
  'TABLE',
  'AIR_QUALITY_DISTRIBUTION',
  'AIR_QUALITY_HEATMAP',
  'HISTORICAL_TRENDS',
  'SENSOR_COMPARISON',
  'METRICS_CARD',
];

export const WidgetConfigPanel: React.FC<WidgetConfigPanelProps> = ({
  widgetId,
  widgetType,
  config,
  onConfigChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({});
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch sensors and locations for filter dropdowns
  const { sensors } = useSensors({ includeLastReading: false, fetchPolicy: 'cache-first' });
  const { locations } = useLocations();

  // Check if this widget type is configurable
  const isConfigurable = CONFIGURABLE_WIDGETS.includes(widgetType);

  // Get fresh config for the panel
  const getInitialConfig = useCallback(() => {
    const defaultConfig = getDefaultWidgetConfig(widgetType);
    return { ...defaultConfig, ...config };
  }, [widgetType, config]);

  // Open the panel and initialize config
  const openPanel = useCallback(() => {
    // Calculate position based on button location
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPosition({
        top: rect.bottom + 4,
        left: Math.max(8, rect.right - 280), // 280px is min-width, keep 8px margin
      });
    }
    // Reset local config to current saved config + defaults
    setLocalConfig(getInitialConfig());
    setIsOpen(true);
  }, [getInitialConfig]);

  // Close without saving - just close, localConfig will be reset on next open
  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closePanel();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closePanel]);

  const handleSave = useCallback(() => {
    onConfigChange(widgetId, localConfig);
    setIsOpen(false);
  }, [widgetId, localConfig, onConfigChange]);

  const updateConfig = useCallback((key: string, value: unknown) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  if (!isConfigurable) {
    return null;
  }

  // Render the panel in a portal so it's not clipped by parent overflow
  const panelContent = isOpen && typeof document !== 'undefined' ? createPortal(
    <div
      ref={panelRef}
      className="fixed z-[9999] bg-white border border-airq-dark shadow-lg rounded min-w-[280px] max-h-[400px] overflow-y-auto"
      style={{ top: panelPosition.top, left: panelPosition.left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 sticky top-0">
        <span className="text-sm font-medium text-airq-dark">Widget Settings</span>
        <button onClick={closePanel} className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>

          {/* Config Options */}
          <div className="p-3 space-y-3">
            {/* Time Range - for charts and table */}
            {(widgetType.includes('CHART') || widgetType === 'TABLE') && (
              <TimeRangeSelect
                value={(localConfig.timeRange as TimeRangePreset) ?? '24h'}
                onChange={(value) => updateConfig('timeRange', value)}
              />
            )}

            {/* Custom Date Range */}
            {localConfig.timeRange === 'custom' && (
              <CustomDateRange
                startDate={localConfig.customStartDate as string | undefined}
                endDate={localConfig.customEndDate as string | undefined}
                onStartDateChange={(value) => updateConfig('customStartDate', value)}
                onEndDateChange={(value) => updateConfig('customEndDate', value)}
              />
            )}

            {/* Sensor Filter */}
            {(widgetType.includes('CHART') || widgetType === 'TABLE' || widgetType.includes('AIR_QUALITY')) && (
              <MultiSelect
                label="Sensors"
                options={sensors?.map(s => ({ value: s.id, label: s.name })) ?? []}
                selected={(localConfig.sensorIds as string[]) ?? []}
                onChange={(values) => updateConfig('sensorIds', values)}
                placeholder="All sensors"
              />
            )}

            {/* Location Filter */}
            {(widgetType.includes('CHART') || widgetType === 'TABLE' || widgetType.includes('AIR_QUALITY')) && (
              <MultiSelect
                label="Locations"
                options={locations?.map(l => ({ value: l.id, label: l.name })) ?? []}
                selected={(localConfig.locationIds as string[]) ?? []}
                onChange={(values) => updateConfig('locationIds', values)}
                placeholder="All locations"
              />
            )}

            {/* Multi-Metric Chart: Metric Selection */}
            {widgetType === 'MULTI_METRIC_CHART' && (
              <MetricSelect
                selected={(localConfig.metrics as string[]) ?? ['co2', 'temperature']}
                onChange={(values) => updateConfig('metrics', values)}
              />
            )}

            {/* Table: Page Size */}
            {widgetType === 'TABLE' && (
              <SelectField
                label="Rows per page"
                value={String((localConfig.pageSize as number) ?? 25)}
                options={[
                  { value: '10', label: '10' },
                  { value: '25', label: '25' },
                  { value: '50', label: '50' },
                  { value: '100', label: '100' },
                ]}
                onChange={(value) => updateConfig('pageSize', parseInt(value))}
              />
            )}

            {/* Table: Temperature Unit */}
            {widgetType === 'TABLE' && (
              <SelectField
                label="Temperature Unit"
                value={(localConfig.temperatureUnit as string) ?? 'fahrenheit'}
                options={[
                  { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
                  { value: 'celsius', label: 'Celsius (°C)' },
                ]}
                onChange={(value) => updateConfig('temperatureUnit', value)}
              />
            )}

            {/* Air Quality Heatmap: Days */}
            {widgetType === 'AIR_QUALITY_HEATMAP' && (
              <SelectField
                label="Time period"
                value={String((localConfig.days as number) ?? 548)}
                options={[
                  { value: '90', label: '3 months' },
                  { value: '180', label: '6 months' },
                  { value: '365', label: '1 year' },
                  { value: '548', label: '1.5 years' },
                  { value: '730', label: '2 years' },
                ]}
                onChange={(value) => updateConfig('days', parseInt(value))}
              />
            )}

            {/* Historical Trends: Metric */}
            {widgetType === 'HISTORICAL_TRENDS' && (
              <SelectField
                label="Metric"
                value={(localConfig.metric as string) ?? 'co2'}
                options={[
                  { value: 'co2', label: 'CO2 (PPM)' },
                  { value: 'temperature', label: 'Temperature' },
                  { value: 'humidity', label: 'Humidity' },
                ]}
                onChange={(value) => updateConfig('metric', value)}
              />
            )}

            {/* Historical Trends: Aggregation */}
            {widgetType === 'HISTORICAL_TRENDS' && (
              <SelectField
                label="Aggregation"
                value={(localConfig.aggregation as string) ?? 'daily'}
                options={[
                  { value: 'daily', label: 'Daily Average' },
                  { value: 'weekly', label: 'Weekly Average' },
                ]}
                onChange={(value) => updateConfig('aggregation', value)}
              />
            )}

            {/* Historical Trends: Show Trend Line */}
            {widgetType === 'HISTORICAL_TRENDS' && (
              <CheckboxField
                label="Show trend line"
                checked={(localConfig.showTrendLine as boolean) ?? true}
                onChange={(checked) => updateConfig('showTrendLine', checked)}
              />
            )}

            {/* Sensor Comparison: Metric */}
            {widgetType === 'SENSOR_COMPARISON' && (
              <SelectField
                label="Metric"
                value={(localConfig.metric as string) ?? 'co2'}
                options={[
                  { value: 'co2', label: 'CO2 (PPM)' },
                  { value: 'temperature', label: 'Temperature' },
                  { value: 'humidity', label: 'Humidity' },
                ]}
                onChange={(value) => updateConfig('metric', value)}
              />
            )}

            {/* Show Legend - for charts */}
            {(widgetType.includes('CHART') || widgetType === 'SENSOR_COMPARISON') && (
              <CheckboxField
                label="Show legend"
                checked={(localConfig.showLegend as boolean) ?? false}
                onChange={(checked) => updateConfig('showLegend', checked)}
              />
            )}

            {/* Show Grid - for charts */}
            {(widgetType.includes('CHART')) && (
              <CheckboxField
                label="Show grid lines"
                checked={(localConfig.showGrid as boolean) ?? true}
                onChange={(checked) => updateConfig('showGrid', checked)}
              />
            )}

            {/* Air Quality Distribution: Period Toggles */}
            {widgetType === 'AIR_QUALITY_DISTRIBUTION' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Periods to Display</label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { value: '24h', label: '24 Hours' },
                    { value: '30d', label: '30 Days' },
                    { value: 'allTime', label: 'All Time' },
                  ].map(period => {
                    const selected = (localConfig.periods as string[]) ?? ['24h', '30d', 'allTime'];
                    const isSelected = selected.includes(period.value);
                    return (
                      <button
                        key={period.value}
                        onClick={() => {
                          if (isSelected && selected.length > 1) {
                            updateConfig('periods', selected.filter(p => p !== period.value));
                          } else if (!isSelected) {
                            updateConfig('periods', [...selected, period.value]);
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded border ${
                          isSelected
                            ? 'bg-airq-primary text-white border-airq-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-airq-primary'
                        }`}
                      >
                        {period.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Air Quality Distribution: Layout */}
            {widgetType === 'AIR_QUALITY_DISTRIBUTION' && (
              <SelectField
                label="Layout"
                value={(localConfig.layout as string) ?? 'vertical'}
                options={[
                  { value: 'vertical', label: 'Vertical' },
                  { value: 'horizontal', label: 'Horizontal' },
                ]}
                onChange={(value) => updateConfig('layout', value)}
              />
            )}

            {/* Table: Visible Columns */}
            {widgetType === 'TABLE' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Visible Columns</label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { value: 'time', label: 'Time' },
                    { value: 'co2', label: 'CO2' },
                    { value: 'temperature', label: 'Temp' },
                    { value: 'humidity', label: 'Humidity' },
                    { value: 'location', label: 'Location' },
                    { value: 'sensor', label: 'Sensor' },
                  ].map(col => {
                    const selected = (localConfig.columns as string[]) ?? ['time', 'co2', 'temperature', 'humidity', 'location'];
                    const isSelected = selected.includes(col.value);
                    return (
                      <button
                        key={col.value}
                        onClick={() => {
                          if (isSelected && selected.length > 1) {
                            updateConfig('columns', selected.filter(c => c !== col.value));
                          } else if (!isSelected) {
                            updateConfig('columns', [...selected, col.value]);
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded border ${
                          isSelected
                            ? 'bg-airq-primary text-white border-airq-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-airq-primary'
                        }`}
                      >
                        {col.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Table: Default Sort */}
            {widgetType === 'TABLE' && (
              <>
                <SelectField
                  label="Default Sort Field"
                  value={((localConfig.defaultSort as Record<string, string>)?.field) ?? 'readingTime'}
                  options={[
                    { value: 'readingTime', label: 'Time' },
                    { value: 'co2Ppm', label: 'CO2' },
                    { value: 'temperature', label: 'Temperature' },
                    { value: 'humidityPercentage', label: 'Humidity' },
                    { value: 'locationName', label: 'Location' },
                  ]}
                  onChange={(value) => updateConfig('defaultSort', {
                    field: value,
                    direction: ((localConfig.defaultSort as Record<string, string>)?.direction) ?? 'desc',
                  })}
                />
                <SelectField
                  label="Sort Direction"
                  value={((localConfig.defaultSort as Record<string, string>)?.direction) ?? 'desc'}
                  options={[
                    { value: 'desc', label: 'Descending' },
                    { value: 'asc', label: 'Ascending' },
                  ]}
                  onChange={(value) => updateConfig('defaultSort', {
                    field: ((localConfig.defaultSort as Record<string, string>)?.field) ?? 'readingTime',
                    direction: value,
                  })}
                />
              </>
            )}

            {/* Metrics Card: Temperature Unit */}
            {widgetType === 'METRICS_CARD' && (
              <SelectField
                label="Temperature Unit"
                value={(localConfig.temperatureUnit as string) ?? 'fahrenheit'}
                options={[
                  { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
                  { value: 'celsius', label: 'Celsius (°C)' },
                ]}
                onChange={(value) => updateConfig('temperatureUnit', value)}
              />
            )}

            {/* Metrics Card: Layout */}
            {widgetType === 'METRICS_CARD' && (
              <SelectField
                label="Layout"
                value={(localConfig.layout as string) ?? '2x4'}
                options={[
                  { value: '2x4', label: '2 columns x 4 rows' },
                  { value: '4x2', label: '4 columns x 2 rows' },
                  { value: 'compact', label: 'Compact' },
                ]}
                onChange={(value) => updateConfig('layout', value)}
              />
            )}

          </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 px-3 py-2 border-t border-gray-200 bg-gray-50 sticky bottom-0">
        <button
          onClick={closePanel}
          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-xs bg-airq-primary text-white rounded hover:bg-airq-primary/90 flex items-center gap-1"
        >
          <Check className="h-3 w-3" />
          Apply
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Settings Button */}
      <button
        ref={buttonRef}
        onClick={isOpen ? closePanel : openPanel}
        className="text-airq-light hover:text-airq-light/80 focus:outline-none p-0.5"
        title="Widget Settings"
      >
        <Settings className="h-3 w-3" />
      </button>

      {/* Config Panel rendered via Portal */}
      {panelContent}
    </>
  );
};

// Time Range Select Component
const TimeRangeSelect: React.FC<{
  value: TimeRangePreset;
  onChange: (value: TimeRangePreset) => void;
}> = ({ value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">Time Range</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TimeRangePreset)}
      className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-airq-primary bg-white text-gray-900"
    >
      {Object.entries(TIME_RANGE_LABELS).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  </div>
);

// Custom Date Range Component
const CustomDateRange: React.FC<{
  startDate?: string;
  endDate?: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}> = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => (
  <div className="grid grid-cols-2 gap-2">
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
      <input
        type="date"
        value={startDate ?? ''}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-airq-primary bg-white text-gray-900"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
      <input
        type="date"
        value={endDate ?? ''}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-airq-primary bg-white text-gray-900"
      />
    </div>
  </div>
);

// Multi-Select Component
const MultiSelect: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}> = ({ label, options, selected, onChange, placeholder }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        {selected.length > 0 && (
          <button
            onClick={clearAll}
            className="text-[10px] text-airq-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-airq-primary bg-white text-gray-900"
      >
        {selected.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <span className="text-gray-900">{selected.length} selected</span>
        )}
      </button>
      {isExpanded && (
        <div className="mt-1 border border-gray-200 rounded max-h-32 overflow-y-auto">
          {options.map(option => (
            <label
              key={option.value}
              className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="h-3 w-3 text-airq-primary rounded border-gray-300"
              />
              <span className="ml-2 text-xs text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Metric Select Component (for Multi-Metric Chart)
const MetricSelect: React.FC<{
  selected: string[];
  onChange: (values: string[]) => void;
}> = ({ selected, onChange }) => {
  const metrics = [
    { value: 'co2', label: 'CO2 (PPM)' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'humidity', label: 'Humidity' },
  ];

  const toggleMetric = (value: string) => {
    if (selected.includes(value)) {
      // Don't allow deselecting all metrics
      if (selected.length > 1) {
        onChange(selected.filter(v => v !== value));
      }
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">Metrics to Display</label>
      <div className="flex flex-wrap gap-1">
        {metrics.map(metric => (
          <button
            key={metric.value}
            onClick={() => toggleMetric(metric.value)}
            className={`px-2 py-1 text-xs rounded border ${
              selected.includes(metric.value)
                ? 'bg-airq-primary text-white border-airq-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:border-airq-primary'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Select Field Component
const SelectField: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-airq-primary bg-white text-gray-900"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

// Checkbox Field Component
const CheckboxField: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-3 w-3 text-airq-primary rounded border-gray-300"
    />
    <span className="ml-2 text-xs text-gray-700">{label}</span>
  </label>
);

export default WidgetConfigPanel;
