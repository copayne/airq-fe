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

  // Helper function to convert Celsius to Fahrenheit
  const celsiusToFahrenheit = (celsius: number | null): number | null => {
    if (celsius === null) return null;
    return (celsius * 9/5) + 32;
  };

  // Helper function to get color classes based on CO2 value
  const getCo2ColorClasses = (value: number | null): { inner: string; outer: string; blur: string } => {
    if (value === null) return { inner: 'bg-airq-light text-airq-dark', outer: 'bg-airq-light/25', blur: 'rgba(243, 244, 255, 0.5)' };
    if (value <= 800) return { inner: 'bg-airq-primary text-airq-light', outer: 'bg-airq-primary/25', blur: 'rgba(19, 117, 71, 0.5)' };
    if (value < 1000) return { inner: 'bg-airq-secondary text-airq-dark', outer: 'bg-airq-secondary/25', blur: 'rgba(255, 201, 20, 0.5)' };
    return { inner: 'bg-airq-tertiary text-airq-light', outer: 'bg-airq-tertiary/25', blur: 'rgba(237, 76, 76, 0.5)' };
  };

  // Helper function to get color classes based on temperature value (Fahrenheit)
  const getTempColorClasses = (value: number | null): { inner: string; outer: string; blur: string } => {
    if (value === null) return { inner: 'bg-airq-light text-airq-dark', outer: 'bg-airq-light/25', blur: 'rgba(243, 244, 255, 0.5)' };
    if (value < 68) return { inner: 'bg-airq-primary text-airq-light', outer: 'bg-airq-primary/25', blur: 'rgba(19, 117, 71, 0.5)' }; // < 20°C
    if (value < 81) return { inner: 'bg-airq-secondary text-airq-dark', outer: 'bg-airq-secondary/25', blur: 'rgba(255, 201, 20, 0.5)' }; // < 27°C
    return { inner: 'bg-airq-tertiary text-airq-light', outer: 'bg-airq-tertiary/25', blur: 'rgba(237, 76, 76, 0.5)' }; // >= 27°C
  };

  // Only show loading if we don't have any data yet
  // This prevents flickering during re-renders or background refetches
  if (loading && metrics === null) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-airq-light">
        <p className="text-airq-dark">Loading metrics...</p>
      </div>
    );
  }

  // Only show error if we don't have any cached data
  if (error !== undefined && metrics === null) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-airq-light">
        <p className="text-airq-tertiary">Error loading metrics</p>
      </div>
    );
  }

  // If we still don't have metrics, show placeholder
  if (metrics === null) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-airq-light">
        <p className="text-airq-dark">No metrics available</p>
      </div>
    );
  }

  const co21dayColors = getCo2ColorClasses(metrics.co21dayAvg);
  const co230dayColors = getCo2ColorClasses(metrics.co230dayAvg);
  const co2HighColors = getCo2ColorClasses(metrics.co2HighestAllTime);
  const co2LowColors = getCo2ColorClasses(metrics.co2LowestAllTime);

  // Convert temperatures to Fahrenheit
  const temp1dayF = celsiusToFahrenheit(metrics.temp1dayAvg);
  const temp30dayF = celsiusToFahrenheit(metrics.temp30dayAvg);
  const tempHighF = celsiusToFahrenheit(metrics.tempHighestAllTime);
  const tempLowF = celsiusToFahrenheit(metrics.tempLowestAllTime);

  const temp1dayColors = getTempColorClasses(temp1dayF);
  const temp30dayColors = getTempColorClasses(temp30dayF);
  const tempHighColors = getTempColorClasses(tempHighF);
  const tempLowColors = getTempColorClasses(tempLowF);

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
          value={temp1dayF}
          unit="°F"
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
          value={temp30dayF}
          unit="°F"
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
          value={tempHighF}
          unit="°F"
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
          value={tempLowF}
          unit="°F"
          colorClass={tempLowColors.inner}
          outerColorClass={tempLowColors.outer}
        />
      </div>
    </div>
  );
});

MetricsCard.displayName = 'MetricsCard';

export default MetricsCard;
