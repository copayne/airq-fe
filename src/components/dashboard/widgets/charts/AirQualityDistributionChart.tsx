/**
 * Air Quality Distribution Multi-Period Chart
 *
 * Displays three doughnut charts showing air quality distribution across different time periods:
 * - Last 24 hours
 * - Last 30 days
 * - All time
 *
 * IMPORTANT: This component is RENDER ONLY. All business logic, calculations,
 * and condition assessments are performed server-side via the GraphQL API.
 */

import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Title,
  Tooltip,
} from 'chart.js';
import React, { memo, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useQuery } from '@apollo/client';
import { GET_AIR_QUALITY_DISTRIBUTIONS_BY_PERIOD } from '~/graphql/AirQuality';
import type { GetAirQualityDistributionsByPeriodData, AirQualityDistribution } from '~/types/sensors';
import { DataStateWrapper } from '~/components/common/DataStateWrapper';
import { CACHE_FIRST_OPTIONS } from '~/lib/apolloDefaults';
import { env } from '~/env.js';

// Register Chart.js components
ChartJS.register(ArcElement, Title, Tooltip, Legend);

interface SingleDoughnutProps {
  distribution: AirQualityDistribution;
  label: string;
}

const SingleDoughnut: React.FC<SingleDoughnutProps> = memo(({ distribution, label }) => {
  // Determine dominant condition
  const dominantCondition = useMemo(() => {
    const max = Math.max(distribution.good, distribution.moderate, distribution.poor);
    if (distribution.poor === max) return 'poor';
    if (distribution.moderate === max) return 'moderate';
    return 'good';
  }, [distribution.good, distribution.moderate, distribution.poor]);

  // Calculate percentage for dominant condition
  const dominantPercentage = useMemo(() => {
    if (distribution.total === 0) return 0;
    const value = distribution[dominantCondition];
    return ((value / distribution.total) * 100).toFixed(1);
  }, [distribution, dominantCondition]);

  // Chart data
  const chartData = useMemo(() => ({
    labels: ['Good', 'Moderate', 'Poor'],
    datasets: [
      {
        data: [distribution.good, distribution.moderate, distribution.poor],
        backgroundColor: ['#137547', '#FFC914', '#ED4C4C'],
        borderColor: ['#137547', '#FFC914', '#ED4C4C'],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }), [distribution.good, distribution.moderate, distribution.poor]);

  // Chart options
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    animation: false, // Disable animations on re-render
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { label?: string; parsed: number }) => {
            const label_text = String(context.label ?? '');
            const value = context.parsed;
            const pct = distribution.total > 0
              ? ((value / distribution.total) * 100).toFixed(1)
              : '0.0';
            return `${label_text}: ${value} (${pct}%)`;
          },
        },
      },
    },
  }), [distribution.total]);

  // Center text plugin
  const centerTextPlugin = useMemo(() => ({
    id: `centerText-${label}`,
    beforeDraw: (chart: ChartJS) => {
      if (distribution.total === 0) return;

      const { ctx, chartArea: { width, height } } = chart;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Time period label
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText(label, centerX, centerY - 10);

      // Dominant percentage
      const conditionColor = dominantCondition === 'good' ? '#137547' : dominantCondition === 'moderate' ? '#FFC914' : '#ED4C4C';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = conditionColor;
      ctx.fillText(`${dominantPercentage}%`, centerX, centerY + 10);

      // Condition text
      const conditionText = dominantCondition.charAt(0).toUpperCase() + dominantCondition.slice(1);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText(conditionText, centerX, centerY + 25);

      ctx.restore();
    },
  }), [distribution.total, label, dominantCondition, dominantPercentage]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32">
        <Doughnut
          data={chartData}
          options={options}
          plugins={[centerTextPlugin]}
        />
      </div>
      <div className="mt-2 text-xs text-gray-600 text-center">
        {distribution.total} readings
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if distribution data or label actually changed
  return (
    prevProps.label === nextProps.label &&
    prevProps.distribution.good === nextProps.distribution.good &&
    prevProps.distribution.moderate === nextProps.distribution.moderate &&
    prevProps.distribution.poor === nextProps.distribution.poor &&
    prevProps.distribution.total === nextProps.distribution.total
  );
});

SingleDoughnut.displayName = 'SingleDoughnut';

const AirQualityDistributionChart: React.FC = memo(() => {
  const { data, loading, error } = useQuery<GetAirQualityDistributionsByPeriodData>(
    GET_AIR_QUALITY_DISTRIBUTIONS_BY_PERIOD,
    {
      ...CACHE_FIRST_OPTIONS,
      pollInterval: env.NEXT_PUBLIC_POLL_INTERVAL_MS,
    }
  );

  const distributions = data?.airQualityDistributionsByPeriod;

  return (
    <DataStateWrapper
      loading={loading}
      error={error}
      data={distributions}
      errorMessage="Error loading air quality distribution data"
      emptyMessage="No air quality data available"
      className="h-full flex items-center justify-center"
      showSpinner={true}
    >
      {distributions && (
        <div className="h-full p-4 flex flex-col">
          {/* Legend */}
          <div className="flex justify-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#137547]"></div>
              <span>Good</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#FFC914]"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ED4C4C]"></div>
              <span>Poor</span>
            </div>
          </div>

          {/* Three doughnut charts - vertically stacked */}
          <div className="flex-1 flex flex-col items-center justify-around gap-2">
            <SingleDoughnut distribution={distributions.oneDay} label="24 Hours" />
            <SingleDoughnut distribution={distributions.thirtyDays} label="30 Days" />
            <SingleDoughnut distribution={distributions.allTime} label="All Time" />
          </div>
        </div>
      )}
    </DataStateWrapper>
  );
});

AirQualityDistributionChart.displayName = 'AirQualityDistributionChart';

export default AirQualityDistributionChart;
