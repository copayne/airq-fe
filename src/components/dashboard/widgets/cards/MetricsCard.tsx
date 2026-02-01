import React, { memo } from 'react';
import { useMetrics } from '~/hooks/useMetrics';
import {
  celsiusToFahrenheit,
  getCO2ColorClasses,
  getTemperatureFahrenheitColorClasses
} from '~/utils/thresholds';
import { DataStateWrapper } from '~/components/common/DataStateWrapper';
import type { MetricsCardConfig } from '~/types/widgetConfig';

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
      className={`flex flex-col justify-center items-center px-1 py-0.5 m-1 border-[1px] border-default-textDark ${colorClass}`}
    >
      <p className="text-[9px] font-light text-center leading-tight">{label}</p>
      <p className="text-xs leading-tight">
        {value !== null ? `${value.toFixed(value % 1 === 0 ? 0 : 1)}${unit}` : '--'}
      </p>
    </div>
  </div>
);

interface MetricsCardProps {
  config?: MetricsCardConfig;
}

const MetricsCard: React.FC<MetricsCardProps> = memo(({ config }) => {
  const { metrics, loading, error } = useMetrics();

  return (
    <DataStateWrapper
      loading={loading}
      error={error}
      data={metrics}
      loadingMessage="Loading metrics..."
      errorMessage="Error loading metrics"
      emptyMessage="No metrics available"
    >
      {metrics && <MetricsContent metrics={metrics} config={config} />}
    </DataStateWrapper>
  );
});

MetricsCard.displayName = 'MetricsCard';

const MetricsContent: React.FC<{ metrics: NonNullable<ReturnType<typeof useMetrics>['metrics']>; config?: MetricsCardConfig }> = ({ metrics, config }) => {
  const useCelsius = config?.temperatureUnit === 'celsius';
  const tempUnit = useCelsius ? '°C' : '°F';

  const convertTemp = (celsius: number | null): number | null => {
    if (celsius === null) return null;
    return useCelsius ? celsius : celsiusToFahrenheit(celsius);
  };

  const co21dayColors = getCO2ColorClasses(metrics.co21dayAvg);
  const co230dayColors = getCO2ColorClasses(metrics.co230dayAvg);
  const co2HighColors = getCO2ColorClasses(metrics.co2HighestAllTime);
  const co2LowColors = getCO2ColorClasses(metrics.co2LowestAllTime);

  const temp1day = convertTemp(metrics.temp1dayAvg);
  const temp30day = convertTemp(metrics.temp30dayAvg);
  const tempHigh = convertTemp(metrics.tempHighestAllTime);
  const tempLow = convertTemp(metrics.tempLowestAllTime);

  // For Fahrenheit colors, convert to F first; for Celsius, still use F conversion for color thresholds
  const temp1dayF = celsiusToFahrenheit(metrics.temp1dayAvg);
  const temp30dayF = celsiusToFahrenheit(metrics.temp30dayAvg);
  const tempHighF = celsiusToFahrenheit(metrics.tempHighestAllTime);
  const tempLowF = celsiusToFahrenheit(metrics.tempLowestAllTime);

  const temp1dayColors = getTemperatureFahrenheitColorClasses(temp1dayF);
  const temp30dayColors = getTemperatureFahrenheitColorClasses(temp30dayF);
  const tempHighColors = getTemperatureFahrenheitColorClasses(tempHighF);
  const tempLowColors = getTemperatureFahrenheitColorClasses(tempLowF);

  const layout = config?.layout ?? '2x4';

  const metricCells = [
    { label: 'CO2 1-Day', value: metrics.co21dayAvg, unit: 'ppm', colorClass: co21dayColors.inner, outerColorClass: co21dayColors.outer },
    { label: 'Temp 1-Day', value: temp1day, unit: tempUnit, colorClass: temp1dayColors.inner, outerColorClass: temp1dayColors.outer },
    { label: 'CO2 30-Day', value: metrics.co230dayAvg, unit: 'ppm', colorClass: co230dayColors.inner, outerColorClass: co230dayColors.outer },
    { label: 'Temp 30-Day', value: temp30day, unit: tempUnit, colorClass: temp30dayColors.inner, outerColorClass: temp30dayColors.outer },
    { label: 'High CO2', value: metrics.co2HighestAllTime, unit: 'ppm', colorClass: co2HighColors.inner, outerColorClass: co2HighColors.outer },
    { label: 'High Temp', value: tempHigh, unit: tempUnit, colorClass: tempHighColors.inner, outerColorClass: tempHighColors.outer },
    { label: 'Low CO2', value: metrics.co2LowestAllTime, unit: 'ppm', colorClass: co2LowColors.inner, outerColorClass: co2LowColors.outer },
    { label: 'Low Temp', value: tempLow, unit: tempUnit, colorClass: tempLowColors.inner, outerColorClass: tempLowColors.outer },
  ];

  if (layout === '4x2') {
    return (
      <div className="h-full w-full grid grid-cols-4 grid-rows-2">
        {metricCells.map((cell) => (
          <MetricCell key={cell.label} {...cell} />
        ))}
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div className="h-full w-full grid grid-cols-4 grid-rows-2">
        {metricCells.map((cell) => (
          <MetricCell key={cell.label} {...cell} />
        ))}
      </div>
    );
  }

  // Default 2x4 layout
  return (
    <div className="h-full w-full flex flex-col">
      {[0, 2, 4, 6].map(i => (
        <div key={i} className="flex h-full">
          <MetricCell {...metricCells[i]!} />
          <MetricCell {...metricCells[i + 1]!} />
        </div>
      ))}
    </div>
  );
};

export default MetricsCard;
