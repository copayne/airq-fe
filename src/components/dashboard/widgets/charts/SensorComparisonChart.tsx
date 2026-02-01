/**
 * Sensor Comparison Chart
 *
 * Overlays the same metric from multiple sensors on one chart.
 * Each sensor gets a distinct color with legend.
 */

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import React, { memo, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useWidgetSensorData } from '~/hooks/useWidgetSensorData';
import { DataStateWrapper } from '~/components/common/DataStateWrapper';
import type { SensorComparisonConfig } from '~/types/widgetConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface SensorReading {
  readingTime: string;
  sensor: { id: string; name: string };
  co2Reading?: { co2Ppm: number } | null;
  temperatureReading?: { temperatureCelsius: number } | null;
  humidityReading?: { humidityPercentage: number } | null;
}

const METRIC_LABELS: Record<string, string> = {
  co2: 'CO2 (PPM)',
  temperature: 'Temperature (°F)',
  humidity: 'Humidity (%)',
};

function extractMetricValue(reading: SensorReading, metric: string): number | null {
  switch (metric) {
    case 'co2':
      return reading.co2Reading?.co2Ppm ?? null;
    case 'temperature':
      return reading.temperatureReading?.temperatureCelsius != null
        ? (reading.temperatureReading.temperatureCelsius * 9) / 5 + 32
        : null;
    case 'humidity':
      return reading.humidityReading?.humidityPercentage ?? null;
    default:
      return null;
  }
}

// Distinct colors for up to 8 sensors
const SENSOR_COLORS = [
  'rgb(34, 197, 94)',
  'rgb(59, 130, 246)',
  'rgb(168, 85, 247)',
  'rgb(249, 115, 22)',
  'rgb(236, 72, 153)',
  'rgb(20, 184, 166)',
  'rgb(245, 158, 11)',
  'rgb(239, 68, 68)',
];

interface SensorComparisonChartProps {
  config?: SensorComparisonConfig;
}

const SensorComparisonChart: React.FC<SensorComparisonChartProps> = memo(({ config }) => {
  const metric = config?.metric ?? 'co2';
  const showLegend = config?.showLegend ?? true;

  const { sensorReadings, loading, error } = useWidgetSensorData({ config });

  const chartData = useMemo(() => {
    if (!sensorReadings?.length) return { datasets: [] };

    // Group readings by sensor
    const bySensor = new Map<string, { name: string; data: { x: Date; y: number }[] }>();

    for (const reading of sensorReadings) {
      const sensorId = reading.sensor?.id;
      if (!sensorId) continue;

      const value = extractMetricValue(reading as SensorReading, metric);
      if (value == null) continue;

      let group = bySensor.get(sensorId);
      if (!group) {
        group = { name: (reading.sensor as { name: string }).name ?? sensorId, data: [] };
        bySensor.set(sensorId, group);
      }
      group.data.push({ x: new Date(`${reading.readingTime}Z`), y: value });
    }

    // Sort each sensor's data by time
    const datasets = Array.from(bySensor.entries()).map(([, group], index) => {
      group.data.sort((a, b) => a.x.getTime() - b.x.getTime());
      const color = SENSOR_COLORS[index % SENSOR_COLORS.length]!;
      return {
        label: group.name,
        data: group.data,
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5,
      };
    });

    return { datasets };
  }, [sensorReadings, metric]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: {
          display: showLegend,
          position: 'top' as const,
          labels: { usePointStyle: true, pointStyle: 'line' as const, font: { size: 9 }, padding: 8 },
        },
        title: { display: false },
      },
      scales: {
        x: {
          type: 'time' as const,
          time: {
            unit: 'hour' as const,
            displayFormats: { hour: 'MMM d, h:mm a' },
            tooltipFormat: 'MMM d, yyyy h:mm a',
          },
        },
        y: {
          beginAtZero: false,
          title: { display: true, text: METRIC_LABELS[metric] ?? metric },
        },
      },
    }),
    [showLegend, metric]
  );

  const hasSensorFilter = (config?.sensorIds?.length ?? 0) > 0;

  return (
    <DataStateWrapper
      loading={loading}
      error={error}
      data={sensorReadings}
      errorMessage="Error loading comparison data"
      emptyMessage={hasSensorFilter ? 'No data for selected sensors' : 'Select sensors in widget settings'}
      className="h-full flex items-center justify-center"
      showSpinner={true}
    >
      <div className="h-full p-2">
        <Line data={chartData} options={options} redraw={false} />
      </div>
    </DataStateWrapper>
  );
});

SensorComparisonChart.displayName = 'SensorComparisonChart';

export default SensorComparisonChart;
