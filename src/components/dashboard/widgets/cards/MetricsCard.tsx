import React, { memo } from 'react';
import { useMetrics } from '~/hooks/useMetrics';
import {
  celsiusToFahrenheit,
  getCO2ColorClasses,
  getTemperatureFahrenheitColorClasses,
} from '~/utils/thresholds';
import { DataStateWrapper } from '~/components/common/DataStateWrapper';
import type { MetricsCardConfig } from '~/types/widgetConfig';

// --- Gauge bar: shows where a value falls across threshold zones ---

interface GaugeBarProps {
  /** Value normalized to 0–1 representing position across the bar */
  position: number;
  /** Threshold breakpoints as fractions of the bar (ascending) */
  thresholds: [number, number];
}

const GaugeBar: React.FC<GaugeBarProps> = ({ position, thresholds }) => {
  const clamped = Math.max(0, Math.min(1, position));
  const [t1, t2] = thresholds;

  return (
    <div className="relative w-full h-2 border-[1px] border-airq-dark flex overflow-hidden">
      {/* Green zone */}
      <div
        className="h-full bg-airq-primary"
        style={{ width: `${t1 * 100}%` }}
      />
      {/* Yellow zone */}
      <div
        className="h-full bg-airq-secondary"
        style={{ width: `${(t2 - t1) * 100}%` }}
      />
      {/* Red zone */}
      <div
        className="h-full bg-airq-tertiary"
        style={{ width: `${(1 - t2) * 100}%` }}
      />
      {/* Needle */}
      <div
        className="absolute top-0 h-full w-[3px] bg-airq-dark -translate-x-1/2"
        style={{ left: `${clamped * 100}%` }}
      />
    </div>
  );
};

// --- Trend indicator: compares 1d to 30d and shows direction ---

interface TrendProps {
  current: number | null;
  baseline: number | null;
}

const TrendIndicator: React.FC<TrendProps> = ({ current, baseline }) => {
  if (current === null || baseline === null) return null;
  const diff = current - baseline;
  if (Math.abs(diff) < 0.5) {
    return <span className="text-[9px] text-airq-dark/60 font-medium">FLAT</span>;
  }
  const up = diff > 0;
  return (
    <span className={`text-[9px] font-bold ${up ? 'text-airq-tertiary' : 'text-airq-primary'}`}>
      {up ? '\u25B2' : '\u25BC'} {Math.abs(diff).toFixed(diff % 1 === 0 ? 0 : 1)}
    </span>
  );
};

// --- Instrument: a single metric "gauge" block ---

interface InstrumentProps {
  label: string;
  value: number | null;
  unit: string;
  avg30d: number | null;
  peak: number | null;
  colorInner: string;
  colorOuter: string;
  /** Gauge position 0–1 */
  gaugePos: number;
  /** Threshold breakpoints for gauge [green→yellow, yellow→red] as 0–1 */
  gaugeThresholds: [number, number];
}

const formatValue = (v: number | null, decimals?: number): string => {
  if (v === null) return '--';
  const d = decimals ?? (v % 1 === 0 ? 0 : 1);
  return v.toFixed(d);
};

const Instrument: React.FC<InstrumentProps> = ({
  label,
  value,
  unit,
  avg30d,
  peak,
  colorInner,
  colorOuter,
  gaugePos,
  gaugeThresholds,
}) => (
  <div className={`flex flex-col flex-1 border-[1px] border-airq-dark ${colorOuter}`}>
    {/* Header row: label + trend */}
    <div className="flex items-center justify-between px-1.5 pt-1">
      <span className="text-[9px] font-bold uppercase tracking-wider text-airq-dark/70">{label}</span>
      <TrendIndicator current={value} baseline={avg30d} />
    </div>

    {/* Hero number */}
    <div className={`mx-1 my-0.5 border-[1px] border-airq-dark ${colorInner} flex items-baseline justify-center gap-0.5 py-0.5`}>
      <span className="text-lg font-bold leading-none tabular-nums">{formatValue(value)}</span>
      <span className="text-[9px] font-medium leading-none">{unit}</span>
    </div>

    {/* Gauge bar */}
    <div className="px-1.5 pb-0.5">
      <GaugeBar position={gaugePos} thresholds={gaugeThresholds} />
    </div>

    {/* Context row: 30d avg + all-time peak */}
    <div className="flex justify-between px-1.5 pb-1">
      <span className="text-[9px] text-airq-dark/60">
        30d <span className="font-medium text-airq-dark/80">{formatValue(avg30d)}</span>
      </span>
      <span className="text-[9px] text-airq-dark/60">
        peak <span className="font-medium text-airq-dark/80">{formatValue(peak)}</span>
      </span>
    </div>
  </div>
);

// --- Main component ---

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

// CO2 gauge: 400–1400 ppm range, thresholds at 800 and 1000
const co2ToGauge = (ppm: number | null): number => {
  if (ppm === null) return 0;
  return (ppm - 400) / (1400 - 400);
};
const CO2_THRESHOLDS: [number, number] = [
  (800 - 400) / (1400 - 400),  // 0.4
  (1000 - 400) / (1400 - 400), // 0.6
];

// Temp gauge (Fahrenheit): 60–90°F range, thresholds at 74 and 77
const tempToGauge = (f: number | null): number => {
  if (f === null) return 0;
  return (f - 60) / (90 - 60);
};
const TEMP_THRESHOLDS: [number, number] = [
  (74 - 60) / (90 - 60),  // ~0.47
  (77 - 60) / (90 - 60),  // ~0.57
];

const MetricsContent: React.FC<{
  metrics: NonNullable<ReturnType<typeof useMetrics>['metrics']>;
  config?: MetricsCardConfig;
}> = ({ metrics, config }) => {
  const useCelsius = config?.temperatureUnit === 'celsius';
  const tempUnit = useCelsius ? '°C' : '°F';

  const convertTemp = (celsius: number | null): number | null => {
    if (celsius === null) return null;
    return useCelsius ? celsius : celsiusToFahrenheit(celsius);
  };

  // Derived values
  const temp1d = convertTemp(metrics.temp1dayAvg);
  const temp30d = convertTemp(metrics.temp30dayAvg);
  const tempPeak = convertTemp(metrics.tempHighestAllTime);

  // Fahrenheit values for color thresholds (always use F internally for colors)
  const temp1dF = celsiusToFahrenheit(metrics.temp1dayAvg);

  // Color classes
  const co2Colors = getCO2ColorClasses(metrics.co21dayAvg);
  const tempColors = getTemperatureFahrenheitColorClasses(temp1dF);

  return (
    <div className="h-full w-full flex">
      <Instrument
        label="CO2"
        value={metrics.co21dayAvg}
        unit="ppm"
        avg30d={metrics.co230dayAvg}
        peak={metrics.co2HighestAllTime}
        colorInner={co2Colors.inner}
        colorOuter={co2Colors.outer}
        gaugePos={co2ToGauge(metrics.co21dayAvg)}
        gaugeThresholds={CO2_THRESHOLDS}
      />
      <Instrument
        label="Temp"
        value={temp1d}
        unit={tempUnit}
        avg30d={temp30d}
        peak={tempPeak}
        colorInner={tempColors.inner}
        colorOuter={tempColors.outer}
        gaugePos={tempToGauge(temp1dF)}
        gaugeThresholds={TEMP_THRESHOLDS}
      />
    </div>
  );
};

export default MetricsCard;
