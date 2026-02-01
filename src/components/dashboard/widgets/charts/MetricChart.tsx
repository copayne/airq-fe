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
import type { ChartWidgetConfig, MultiMetricChartConfig } from '~/types/widgetConfig';

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
  sensor?: { id: string } | null;
  location?: { id: string } | null;
}

interface MetricConfig {
  key: 'co2' | 'temperature' | 'humidity';
  label: string;
  color: string;
  backgroundColor: string;
  yAxisId?: string;
  yAxisConfig?: {
    title: string;
    position: 'left' | 'right';
    color?: string;
    drawOnChartArea?: boolean;
  };
  extractValue: (reading: SensorReading) => number | null;
  filterReading: (reading: SensorReading) => boolean;
}

interface MetricChartProps {
  metrics: MetricConfig[];
  showLegend?: boolean;
  errorMessage?: string;
  config?: ChartWidgetConfig;
}

const MetricChart: React.FC<MetricChartProps> = memo(({
  metrics,
  showLegend = false,
  errorMessage = 'Error loading chart data',
  config,
}) => {
  // Fetch data based on widget config - API handles filtering
  const { sensorReadings, loading, error } = useWidgetSensorData({ config });

  const chartData = useMemo(() => {
    if (!sensorReadings?.length) {
      return {
        labels: [],
        datasets: []
      };
    }

    const sortedReadings = sensorReadings
      .filter(reading => metrics.some(m => m.filterReading(reading)))
      .sort((a, b) => new Date(`${a.readingTime}Z`).getTime() - new Date(`${b.readingTime}Z`).getTime());

    const datasets = metrics.map(metric => {
      const data = sortedReadings
        .filter(metric.filterReading)
        .map(reading => ({
          x: new Date(`${reading.readingTime}Z`),
          y: metric.extractValue(reading)
        }));

      return {
        label: metric.label,
        data,
        borderColor: metric.color,
        backgroundColor: metric.backgroundColor,
        yAxisID: metric.yAxisId,
        tension: 0.1,
        pointRadius: metrics.length > 1 ? 2 : 3,
        pointHoverRadius: metrics.length > 1 ? 4 : 5,
      };
    });

    return { datasets };
  }, [sensorReadings, metrics]);

  const options = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scales: Record<string, any> = {
      x: {
        type: 'time' as const,
        time: {
          unit: 'hour' as const,
          displayFormats: {
            hour: 'MMM d, h:mm a'
          },
          tooltipFormat: 'MMM d, yyyy h:mm a'
        },
        adapters: {
          date: {}
        }
      }
    };

    metrics.forEach(metric => {
      if (metric.yAxisConfig) {
        scales[metric.yAxisId ?? 'y'] = {
          type: 'linear' as const,
          display: true,
          position: metric.yAxisConfig.position,
          title: {
            display: true,
            text: metric.yAxisConfig.title,
            color: metric.yAxisConfig.color
          },
          ticks: {
            color: metric.yAxisConfig.color
          },
          grid: {
            drawOnChartArea: metric.yAxisConfig.drawOnChartArea ?? true,
            color: metric.yAxisConfig.color ? `${metric.yAxisConfig.color}1A` : undefined
          }
        };
      } else {
        scales.y = {
          beginAtZero: false,
          title: {
            display: true,
            text: metric.label.split(' ').pop() // Extract unit from label (e.g., "PPM" from "CO2 (PPM)")
          }
        };
      }
    });

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      transitions: {
        active: {
          animation: {
            duration: 0
          }
        }
      },
      interaction: metrics.length > 1 ? {
        mode: 'index' as const,
        intersect: false
      } : undefined,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            pointStyle: 'line' as const,
            font: {
              size: 9
            },
            padding: 8
          }
        },
        title: {
          display: false
        }
      },
      scales
    };
  }, [metrics, showLegend]);

  // Determine legend/grid display - use config if provided, otherwise prop
  const displayLegend = config?.showLegend ?? showLegend;
  const displayGrid = config?.showGrid ?? true;

  return (
    <DataStateWrapper
      loading={loading}
      error={error}
      data={sensorReadings}
      errorMessage={errorMessage}
      emptyMessage={(config?.sensorIds?.length ?? 0) > 0 || (config?.locationIds?.length ?? 0) > 0
        ? "No data for selected filters"
        : "No sensor data available"}
      className="h-full flex items-center justify-center"
      showSpinner={true}
    >
      <div className="h-full p-2">
        <Line
          data={chartData}
          options={{
            ...options,
            plugins: {
              ...options.plugins,
              legend: {
                ...options.plugins.legend,
                display: displayLegend,
              },
            },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            scales: Object.fromEntries(
              Object.entries(options.scales).map(([key, scale]) => [
                key,
                { ...(scale as Record<string, unknown>), grid: { ...((scale as Record<string, unknown>).grid as Record<string, unknown> ?? {}), display: displayGrid } },
              ])
            ),
          }}
          redraw={false}
        />
      </div>
    </DataStateWrapper>
  );
});

MetricChart.displayName = 'MetricChart';

export default MetricChart;

// Props interface for configurable chart instances
interface ConfigurableChartProps {
  config?: ChartWidgetConfig;
}

// Pre-configured chart instances with config support
export const CO2Chart: React.FC<ConfigurableChartProps> = memo(({ config }) => (
  <MetricChart
    metrics={[{
      key: 'co2',
      label: 'CO2 (PPM)',
      color: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      extractValue: (reading) => reading.co2Reading?.co2Ppm ?? null,
      filterReading: (reading) => reading.co2Reading?.co2Ppm != null,
    }]}
    errorMessage="Error loading CO2 data"
    config={config}
  />
));
CO2Chart.displayName = 'CO2Chart';

export const TemperatureChart: React.FC<ConfigurableChartProps> = memo(({ config }) => (
  <MetricChart
    metrics={[{
      key: 'temperature',
      label: 'Temperature (°F)',
      color: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      extractValue: (reading) =>
        reading.temperatureReading?.temperatureCelsius != null
          ? (reading.temperatureReading.temperatureCelsius * 9/5) + 32
          : null,
      filterReading: (reading) => reading.temperatureReading?.temperatureCelsius != null,
    }]}
    errorMessage="Error loading temperature data"
    config={config}
  />
));
TemperatureChart.displayName = 'TemperatureChart';

export const HumidityChart: React.FC<ConfigurableChartProps> = memo(({ config }) => (
  <MetricChart
    metrics={[{
      key: 'humidity',
      label: 'Humidity (%)',
      color: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      extractValue: (reading) => reading.humidityReading?.humidityPercentage ?? null,
      filterReading: (reading) => reading.humidityReading?.humidityPercentage != null,
    }]}
    errorMessage="Error loading humidity data"
    config={config}
  />
));
HumidityChart.displayName = 'HumidityChart';

const ALL_MULTI_METRICS: Record<string, MetricConfig & { yAxisId: string; yAxisConfig: MetricConfig['yAxisConfig'] }> = {
  co2: {
    key: 'co2',
    label: 'CO2 (PPM)',
    color: '#137547',
    backgroundColor: 'rgba(19, 117, 71, 0.1)',
    yAxisId: 'yCO2',
    yAxisConfig: {
      title: 'CO2 (PPM)',
      position: 'left',
      color: '#137547',
      drawOnChartArea: true,
    },
    extractValue: (reading) => reading.co2Reading?.co2Ppm ?? null,
    filterReading: (reading) => reading.co2Reading?.co2Ppm != null,
  },
  temperature: {
    key: 'temperature',
    label: 'Temperature (°F)',
    color: '#2E2EAB',
    backgroundColor: 'rgba(46, 46, 171, 0.1)',
    yAxisId: 'yTemp',
    yAxisConfig: {
      title: 'Temperature (°F)',
      position: 'right',
      color: '#2E2EAB',
      drawOnChartArea: false,
    },
    extractValue: (reading) =>
      reading.temperatureReading?.temperatureCelsius != null
        ? (reading.temperatureReading.temperatureCelsius * 9/5) + 32
        : null,
    filterReading: (reading) => reading.temperatureReading?.temperatureCelsius != null,
  },
  humidity: {
    key: 'humidity',
    label: 'Humidity (%)',
    color: 'rgb(168, 85, 247)',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    yAxisId: 'yHumidity',
    yAxisConfig: {
      title: 'Humidity (%)',
      position: 'right',
      color: 'rgb(168, 85, 247)',
      drawOnChartArea: false,
    },
    extractValue: (reading) => reading.humidityReading?.humidityPercentage ?? null,
    filterReading: (reading) => reading.humidityReading?.humidityPercentage != null,
  },
};

interface MultiMetricChartProps {
  config?: MultiMetricChartConfig;
}

export const MultiMetricChart: React.FC<MultiMetricChartProps> = memo(({ config }) => {
  const selectedMetrics = config?.metrics ?? ['co2', 'temperature'];
  // Ensure first metric draws on chart area, others don't
  const metrics = selectedMetrics
    .map((key, index) => {
      const metric = ALL_MULTI_METRICS[key];
      if (!metric) return null;
      return {
        ...metric,
        yAxisConfig: {
          ...metric.yAxisConfig,
          position: index === 0 ? 'left' as const : 'right' as const,
          drawOnChartArea: index === 0,
        },
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null) as MetricConfig[];

  return (
    <MetricChart
      metrics={metrics}
      showLegend={true}
      errorMessage="Error loading environmental data"
      config={config}
    />
  );
});
MultiMetricChart.displayName = 'MultiMetricChart';
