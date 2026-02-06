import React, { memo, useCallback, useEffect, useState } from 'react';
import { CO2Chart, TemperatureChart, HumidityChart } from '~/components/dashboard/widgets/charts/MetricChart';
import type { ChartWidgetConfig, TimeRangePreset } from '~/types/widgetConfig';

export type SparklineMetric = 'co2' | 'temperature' | 'humidity';

interface SparklineModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: SparklineMetric;
  sensorId: string;
  sensorName?: string;
}

const METRIC_LABELS: Record<SparklineMetric, string> = {
  co2: 'CO2',
  temperature: 'Temperature',
  humidity: 'Humidity',
};

const TIME_RANGE_OPTIONS: { value: TimeRangePreset; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
];

const SparklineModal: React.FC<SparklineModalProps> = memo(({
  isOpen,
  onClose,
  metric,
  sensorId,
  sensorName,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('24h');

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const chartConfig: ChartWidgetConfig = {
    timeRange,
    sensorIds: [sensorId],
  };

  const ChartComponent = {
    co2: CO2Chart,
    temperature: TemperatureChart,
    humidity: HumidityChart,
  }[metric];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-airq-light rounded-lg shadow-xl w-[90vw] max-w-3xl h-[60vh] max-h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-airq-dark/20">
          <div>
            <h2 className="text-lg font-semibold text-airq-dark">
              {METRIC_LABELS[metric]} Trend
            </h2>
            {sensorName && (
              <p className="text-sm text-airq-dark/60">{sensorName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Time range selector */}
            <div className="flex gap-1 mr-4">
              {TIME_RANGE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTimeRange(value)}
                  className={`px-3 py-1 text-sm rounded ${
                    timeRange === value
                      ? 'bg-airq-dark text-airq-light'
                      : 'bg-airq-dark/10 text-airq-dark hover:bg-airq-dark/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-airq-dark/10"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-airq-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 p-4">
          <ChartComponent config={chartConfig} />
        </div>
      </div>
    </div>
  );
});

SparklineModal.displayName = 'SparklineModal';

export default SparklineModal;
