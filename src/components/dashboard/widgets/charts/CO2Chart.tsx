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

const CO2Chart: React.FC = memo(() => {
  const { sensorReadings, loading, error } = useSensorReadingData();

  const chartData = useMemo(() => {
    if (!sensorReadings?.length) {
      return {
        labels: [],
        datasets: []
      };
    }

    const co2Data = sensorReadings
      .filter(reading => reading.co2Reading?.co2Ppm != null)
      .sort((a, b) => new Date(`${a.readingTime}Z`).getTime() - new Date(`${b.readingTime}Z`).getTime())
      .map(reading => ({
        x: new Date(`${reading.readingTime}Z`), // Convert UTC to local timezone
        y: reading.co2Reading.co2Ppm
      }));

    return {
      datasets: [{
        label: 'CO2 (PPM)',
        data: co2Data,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
          text: 'PPM'
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
        Error loading CO2 data
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

CO2Chart.displayName = 'CO2Chart';

export default CO2Chart;