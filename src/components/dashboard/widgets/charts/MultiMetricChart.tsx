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
import { useSensorReadingData } from '~/hooks/useSensorReadingData';

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

const MultiMetricChart: React.FC = memo(() => {
  const { sensorReadings, loading, error } = useSensorReadingData();

  const chartData = useMemo(() => {
    if (!sensorReadings?.length) {
      return {
        labels: [],
        datasets: []
      };
    }

    const sortedReadings = sensorReadings
      .filter(reading => 
        reading.co2Reading?.co2Ppm != null || 
        reading.temperatureReading?.temperatureCelsius != null
      )
      .sort((a, b) => new Date(`${a.readingTime}Z`).getTime() - new Date(`${b.readingTime}Z`).getTime());

    const co2Data = sortedReadings
      .filter(reading => reading.co2Reading?.co2Ppm != null)
      .map(reading => ({
        x: new Date(`${reading.readingTime}Z`),
        y: reading.co2Reading.co2Ppm
      }));

    const temperatureData = sortedReadings
      .filter(reading => reading.temperatureReading?.temperatureCelsius != null)
      .map(reading => ({
        x: new Date(`${reading.readingTime}Z`),
        y: (reading.temperatureReading.temperatureCelsius * 9/5) + 32 // Convert to Fahrenheit
      }));

    return {
      datasets: [
        {
          label: 'CO2 (PPM)',
          data: co2Data,
          borderColor: '#137547',
          backgroundColor: 'rgba(19, 117, 71, 0.1)',
          yAxisID: 'yCO2',
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 4,
        },
        {
          label: 'Temperature (°F)',
          data: temperatureData,
          borderColor: '#2E2EAB',
          backgroundColor: 'rgba(46, 46, 171, 0.1)',
          yAxisID: 'yTemp',
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 4,
        }
      ]
    };
  }, [sensorReadings]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Disable all animations
    },
    transitions: {
      active: {
        animation: {
          duration: 0
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'line' as const,
          font: {
            size: 11
          }
        }
      }
    },
    scales: {
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
      },
      yCO2: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'CO2 (PPM)',
          color: '#137547'
        },
        ticks: {
          color: '#137547'
        },
        grid: {
          drawOnChartArea: true,
          color: 'rgba(19, 117, 71, 0.1)'
        }
      },
      yTemp: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Temperature (°F)',
          color: '#2E2EAB'
        },
        ticks: {
          color: '#2E2EAB'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }), []);

  // Only show loading spinner if we don't have any data yet
  // This prevents the chart from flickering during re-renders or background refetches
  if (loading && !sensorReadings?.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-airq-contrast"></div>
      </div>
    );
  }

  // Only show error if we don't have any cached data
  if (error && !sensorReadings?.length) {
    return (
      <div className="h-full flex items-center justify-center text-airq-tertiary">
        Error loading environmental data
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <Line
        data={chartData}
        options={options}
        redraw={false}
      />
    </div>
  );
});

MultiMetricChart.displayName = 'MultiMetricChart';

export default MultiMetricChart;