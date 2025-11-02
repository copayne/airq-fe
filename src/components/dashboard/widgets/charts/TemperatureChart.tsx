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

const TemperatureChart: React.FC = memo(() => {
  const { sensorReadings, loading, error } = useSensorReadingData();

  const chartData = useMemo(() => {
    if (!sensorReadings?.length) {
      return {
        labels: [],
        datasets: []
      };
    }

    const temperatureData = sensorReadings
      .filter(reading => reading.temperatureReading?.temperatureCelsius != null)
      .sort((a, b) => new Date(`${a.readingTime}Z`).getTime() - new Date(`${b.readingTime}Z`).getTime())
      .map(reading => ({
        x: new Date(`${reading.readingTime}Z`), // Convert UTC to local timezone
        y: (reading.temperatureReading.temperatureCelsius * 9/5) + 32 // Convert to Fahrenheit
      }));

    return {
      datasets: [{
        label: 'Temperature (°F)',
        data: temperatureData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      }]
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
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
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
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: '°F'
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
        Error loading temperature data
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

TemperatureChart.displayName = 'TemperatureChart';

export default TemperatureChart;