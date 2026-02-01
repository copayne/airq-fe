/**
 * Historical Trends Chart
 *
 * Shows daily or weekly averaged data for a selected metric over long time ranges.
 * Includes optional linear regression trend line.
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
import type { HistoricalTrendsConfig } from '~/types/widgetConfig';

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
  co2Reading?: { co2Ppm: number } | null;
  temperatureReading?: { temperatureCelsius: number } | null;
  humidityReading?: { humidityPercentage: number } | null;
}

const METRIC_CONFIG = {
  co2: {
    label: 'CO2 (PPM)',
    color: 'rgb(34, 197, 94)',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    extract: (r: SensorReading) => r.co2Reading?.co2Ppm ?? null,
  },
  temperature: {
    label: 'Temperature (°F)',
    color: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    extract: (r: SensorReading) =>
      r.temperatureReading?.temperatureCelsius != null
        ? (r.temperatureReading.temperatureCelsius * 9) / 5 + 32
        : null,
  },
  humidity: {
    label: 'Humidity (%)',
    color: 'rgb(168, 85, 247)',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    extract: (r: SensorReading) => r.humidityReading?.humidityPercentage ?? null,
  },
} as const;

/** Bucket readings into daily or weekly averages */
function aggregateReadings(
  readings: SensorReading[],
  metric: keyof typeof METRIC_CONFIG,
  aggregation: 'daily' | 'weekly'
): { x: Date; y: number }[] {
  const extract = METRIC_CONFIG[metric].extract;
  const buckets = new Map<string, { sum: number; count: number; date: Date }>();

  for (const reading of readings) {
    const value = extract(reading);
    if (value == null) continue;

    const date = new Date(`${reading.readingTime}Z`);
    let bucketKey: string;

    if (aggregation === 'daily') {
      bucketKey = date.toISOString().slice(0, 10);
    } else {
      // Weekly: bucket by ISO week start (Monday)
      const day = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((day + 6) % 7));
      bucketKey = monday.toISOString().slice(0, 10);
    }

    const existing = buckets.get(bucketKey);
    if (existing) {
      existing.sum += value;
      existing.count += 1;
    } else {
      const bucketDate = new Date(bucketKey + 'T12:00:00Z');
      buckets.set(bucketKey, { sum: value, count: 1, date: bucketDate });
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((b) => ({ x: b.date, y: b.sum / b.count }));
}

/** Simple linear regression returning start/end points for trend line */
function linearRegression(data: { x: Date; y: number }[]): { x: Date; y: number }[] {
  if (data.length < 2) return [];

  const n = data.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  const baseTime = data[0]!.x.getTime();
  for (const point of data) {
    const xVal = (point.x.getTime() - baseTime) / 86400000; // days from start
    sumX += xVal;
    sumY += point.y;
    sumXY += xVal * point.y;
    sumX2 += xVal * xVal;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const firstX = 0;
  const lastX = (data[data.length - 1]!.x.getTime() - baseTime) / 86400000;

  return [
    { x: data[0]!.x, y: intercept + slope * firstX },
    { x: data[data.length - 1]!.x, y: intercept + slope * lastX },
  ];
}

interface HistoricalTrendsChartProps {
  config?: HistoricalTrendsConfig;
}

const HistoricalTrendsChart: React.FC<HistoricalTrendsChartProps> = memo(({ config }) => {
  const metric = config?.metric ?? 'co2';
  const aggregation = config?.aggregation ?? 'daily';
  const showTrendLine = config?.showTrendLine ?? true;
  const metricInfo = METRIC_CONFIG[metric];

  const { sensorReadings, loading, error } = useWidgetSensorData({ config });

  const chartData = useMemo(() => {
    if (!sensorReadings?.length) return { datasets: [] };

    const aggregated = aggregateReadings(sensorReadings, metric, aggregation);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const datasets: any[] = [
      {
        label: `${metricInfo.label} (${aggregation === 'daily' ? 'Daily' : 'Weekly'} Avg)`,
        data: aggregated,
        borderColor: metricInfo.color,
        backgroundColor: metricInfo.backgroundColor,
        tension: 0.3,
        pointRadius: aggregated.length > 60 ? 1 : 3,
        pointHoverRadius: 5,
        fill: true,
      },
    ];

    if (showTrendLine && aggregated.length >= 2) {
      const trendData = linearRegression(aggregated);
      datasets.push({
        label: 'Trend',
        data: trendData,
        borderColor: 'rgba(107, 114, 128, 0.7)',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      });
    }

    return { datasets };
  }, [sensorReadings, metric, aggregation, showTrendLine, metricInfo]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: {
        legend: {
          display: showTrendLine,
          position: 'top' as const,
          labels: { usePointStyle: true, pointStyle: 'line' as const, font: { size: 9 }, padding: 8 },
        },
        title: { display: false },
      },
      scales: {
        x: {
          type: 'time' as const,
          time: {
            unit: aggregation === 'weekly' ? ('week' as const) : ('day' as const),
            displayFormats: { day: 'MMM d', week: 'MMM d' },
            tooltipFormat: 'MMM d, yyyy',
          },
        },
        y: {
          beginAtZero: false,
          title: { display: true, text: metricInfo.label },
        },
      },
    }),
    [aggregation, showTrendLine, metricInfo]
  );

  return (
    <DataStateWrapper
      loading={loading}
      error={error}
      data={sensorReadings}
      errorMessage="Error loading historical trends"
      emptyMessage="No sensor data available"
      className="h-full flex items-center justify-center"
      showSpinner={true}
    >
      <div className="h-full p-2">
        <Line data={chartData} options={options} redraw={false} />
      </div>
    </DataStateWrapper>
  );
});

HistoricalTrendsChart.displayName = 'HistoricalTrendsChart';

export default HistoricalTrendsChart;
