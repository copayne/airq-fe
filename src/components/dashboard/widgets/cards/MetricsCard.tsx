import React, { memo } from 'react';
import { useMetrics } from '~/hooks/useMetrics';
import {
  celsiusToFahrenheit,
  getCO2ColorClasses,
  getTemperatureFahrenheitColorClasses
} from '~/utils/thresholds';
import { DataStateWrapper } from '~/components/common/DataStateWrapper';

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

  return (
    <DataStateWrapper
      loading={loading}
      error={error}
      data={metrics}
      loadingMessage="Loading metrics..."
      errorMessage="Error loading metrics"
      emptyMessage="No metrics available"
    >
      {metrics && <MetricsContent metrics={metrics} />}
    </DataStateWrapper>
  );
});

MetricsCard.displayName = 'MetricsCard';

const MetricsContent: React.FC<{ metrics: NonNullable<ReturnType<typeof useMetrics>['metrics']> }> = ({ metrics }) => {
  const co21dayColors = getCO2ColorClasses(metrics.co21dayAvg);
  const co230dayColors = getCO2ColorClasses(metrics.co230dayAvg);
  const co2HighColors = getCO2ColorClasses(metrics.co2HighestAllTime);
  const co2LowColors = getCO2ColorClasses(metrics.co2LowestAllTime);

  // Convert temperatures to Fahrenheit
  const temp1dayF = celsiusToFahrenheit(metrics.temp1dayAvg);
  const temp30dayF = celsiusToFahrenheit(metrics.temp30dayAvg);
  const tempHighF = celsiusToFahrenheit(metrics.tempHighestAllTime);
  const tempLowF = celsiusToFahrenheit(metrics.tempLowestAllTime);

  const temp1dayColors = getTemperatureFahrenheitColorClasses(temp1dayF);
  const temp30dayColors = getTemperatureFahrenheitColorClasses(temp30dayF);
  const tempHighColors = getTemperatureFahrenheitColorClasses(tempHighF);
  const tempLowColors = getTemperatureFahrenheitColorClasses(tempLowF);

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
};

export default MetricsCard;
