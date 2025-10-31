import React, { memo } from 'react';
import { useMetrics } from '~/hooks/useMetrics';

interface MetricCellProps {
  label: string;
  value: number | null;
  unit: string;
  colorClass?: string;
  outerColorClass?: string;
}

const MetricCell: React.FC<MetricCellProps> = ({
  label,
  value,
  unit,
  colorClass = 'bg-airq-light text-airq-dark',
  outerColorClass = 'bg-airq-light/25',
}) => (
  <div className={`flex flex-col flex-grow justify-center items-center w-1/2 border-[1px] border-default-textDark ${outerColorClass}`}>
    <div
      className={`flex flex-col justify-center items-center px-1.5 py-1 m-2 border-[1px] border-default-textDark ${colorClass}`}
    >
      <p className="text-xxs font-light text-center leading-tight">{label}</p>
      <p className="text-sm leading-tight">
        {value !== null ? `${value.toFixed(value % 1 === 0 ? 0 : 1)}${unit}` : '--'}
      </p>
    </div>
  </div>
);

const MetricsCard: React.FC = memo(() => {
  const { metrics, loading, error } = useMetrics();

  // Helper function to get color classes based on CO2 value
  const getCo2ColorClasses = (value: number | null): { inner: string; outer: string; blur: string } => {
    if (value === null) return { inner: 'bg-airq-light text-airq-dark', outer: 'bg-airq-light/25', blur: 'rgba(243, 244, 255, 0.5)' };
    if (value <= 800) return { inner: 'bg-airq-primary text-airq-light', outer: 'bg-airq-primary/25', blur: 'rgba(19, 117, 71, 0.5)' };
    if (value < 1000) return { inner: 'bg-airq-secondary text-airq-dark', outer: 'bg-airq-secondary/25', blur: 'rgba(255, 201, 20, 0.5)' };
    return { inner: 'bg-airq-tertiary text-airq-light', outer: 'bg-airq-tertiary/25', blur: 'rgba(237, 76, 76, 0.5)' };
  };

  // Helper function to get color classes based on temperature value (Celsius)
  const getTempColorClasses = (value: number | null): { inner: string; outer: string; blur: string } => {
    if (value === null) return { inner: 'bg-airq-light text-airq-dark', outer: 'bg-airq-light/25', blur: 'rgba(243, 244, 255, 0.5)' };
    if (value < 20) return { inner: 'bg-airq-primary text-airq-light', outer: 'bg-airq-primary/25', blur: 'rgba(19, 117, 71, 0.5)' };
    if (value < 27) return { inner: 'bg-airq-secondary text-airq-dark', outer: 'bg-airq-secondary/25', blur: 'rgba(255, 201, 20, 0.5)' };
    return { inner: 'bg-airq-tertiary text-airq-light', outer: 'bg-airq-tertiary/25', blur: 'rgba(237, 76, 76, 0.5)' };
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-airq-light">
        <p className="text-airq-dark">Loading metrics...</p>
      </div>
    );
  }

  if (error !== undefined || metrics === null) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-airq-light">
        <p className="text-airq-tertiary">Error loading metrics</p>
      </div>
    );
  }

  const co21dayColors = getCo2ColorClasses(metrics.co21dayAvg);
  const co230dayColors = getCo2ColorClasses(metrics.co230dayAvg);
  const co2HighColors = getCo2ColorClasses(metrics.co2HighestAllTime);
  const co2LowColors = getCo2ColorClasses(metrics.co2LowestAllTime);
  const temp1dayColors = getTempColorClasses(metrics.temp1dayAvg);
  const temp30dayColors = getTempColorClasses(metrics.temp30dayAvg);
  const tempHighColors = getTempColorClasses(metrics.tempHighestAllTime);
  const tempLowColors = getTempColorClasses(metrics.tempLowestAllTime);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex h-full">
        <MetricCell
          label="CO2 1-Day"
          value={metrics.co21dayAvg}
          unit="ppm"
          colorClass={co21dayColors.inner}
          outerColorClass={co21dayColors.outer}
        />
        <MetricCell
          label="Temp 1-Day"
          value={metrics.temp1dayAvg}
          unit="°C"
          colorClass={temp1dayColors.inner}
          outerColorClass={temp1dayColors.outer}
        />
      </div>
      <div className="flex h-full">
        <MetricCell
          label="CO2 30-Day"
          value={metrics.co230dayAvg}
          unit="ppm"
          colorClass={co230dayColors.inner}
          outerColorClass={co230dayColors.outer}
        />
        <MetricCell
          label="Temp 30-Day"
          value={metrics.temp30dayAvg}
          unit="°C"
          colorClass={temp30dayColors.inner}
          outerColorClass={temp30dayColors.outer}
        />
      </div>
      <div className="flex h-full">
        <MetricCell
          label="High C02"
          value={metrics.co2HighestAllTime}
          unit="ppm"
          colorClass={co2HighColors.inner}
          outerColorClass={co2HighColors.outer}
        />
        <MetricCell
          label="High Temp"
          value={metrics.tempHighestAllTime}
          unit="°C"
          colorClass={tempHighColors.inner}
          outerColorClass={tempHighColors.outer}
        />
      </div>
      <div className="flex h-full">
        <MetricCell
          label="Low C02"
          value={metrics.co2LowestAllTime}
          unit="ppm"
          colorClass={co2LowColors.inner}
          outerColorClass={co2LowColors.outer}
        />
        <MetricCell
          label="Low Temp"
          value={metrics.tempLowestAllTime}
          unit="°C"
          colorClass={tempLowColors.inner}
          outerColorClass={tempLowColors.outer}
        />
      </div>
    </div>
  );
});

MetricsCard.displayName = 'MetricsCard';

export default MetricsCard;
