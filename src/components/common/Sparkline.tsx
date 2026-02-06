import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js';
import React, { memo, useMemo } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

interface SparklineProps {
  data: number[];
  color: string;
  onClick?: () => void;
  loading?: boolean;
}

const Sparkline: React.FC<SparklineProps> = memo(({
  data,
  color,
  onClick,
  loading = false,
}) => {
  const chartData = useMemo(() => ({
    labels: data.map((_, i) => i.toString()),
    datasets: [{
      data,
      borderColor: color,
      backgroundColor: `${color}20`,
      borderWidth: 1.5,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 0,
    }],
  }), [data, color]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        display: false,
        grid: { display: false },
      },
      y: {
        display: false,
        grid: { display: false },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }), []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="h-[16px] w-full min-w-0 flex items-center justify-center">
        <div className="h-[8px] w-full bg-current opacity-20 rounded animate-pulse" />
      </div>
    );
  }

  // No data state
  if (!data.length) {
    return (
      <div className="h-[16px] w-full min-w-0 flex items-center justify-center">
        <div className="h-[1px] w-full bg-current opacity-30" />
      </div>
    );
  }

  return (
    <div
      className={`h-[16px] w-full min-w-0 overflow-hidden ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="h-full w-full">
        <Line data={chartData} options={options} redraw={false} />
      </div>
    </div>
  );
});

Sparkline.displayName = 'Sparkline';

export default Sparkline;
