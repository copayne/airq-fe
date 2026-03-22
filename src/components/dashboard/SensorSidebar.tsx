import React, { memo, useState, useCallback } from 'react';
import { useSensors } from '~/hooks/useSensors';
import { useAdaptivePollInterval } from '~/hooks/useAdaptivePollInterval';
import type { Sensor } from '~/types/sensors';
import { formatSensorDetails } from '~/utils/sensorFormatters';
import { getRelativeTime as getRelativeTimeUtil } from '~/utils/dateUtils';
import {
  getCO2ColorClasses,
  getHumidityColorClasses,
  getTemperatureCelsiusColorClasses
} from '~/utils/thresholds';
import Sparkline from '~/components/common/Sparkline';
import SparklineModal, { type SparklineMetric } from '~/components/common/SparklineModal';
import { useSparklineData } from '~/hooks/useSparklineData';
import AnimatedNumber from '~/components/common/AnimatedNumber';
import { CompactSensorCardSkeleton } from '~/components/common/Skeleton';

// Sparkline colors matching the chart colors
const SPARKLINE_COLORS = {
  co2: 'rgb(34, 197, 94)',
  temperature: 'rgb(59, 130, 246)',
  humidity: 'rgb(168, 85, 247)',
} as const;

interface CompactSensorCardProps {
  sensor: Sensor;
  compact?: boolean;
}

const CompactSensorCard: React.FC<CompactSensorCardProps> = memo(({ sensor, compact = false }) => {
  const [modalMetric, setModalMetric] = useState<SparklineMetric | null>(null);

  const {
    co2,
    co2Raw,
    humidity,
    humidityRaw,
    tempRaw,
    temperatureFahrenheit,
    lastReading,
  } = formatSensorDetails(sensor);

  const {
    co2Data,
    temperatureData,
    humidityData,
    loading: sparklineLoading,
  } = useSparklineData(sensor.id);

  const openModal = useCallback((metric: SparklineMetric) => {
    setModalMetric(metric);
  }, []);

  const closeModal = useCallback(() => {
    setModalMetric(null);
  }, []);

  const co2Colors = getCO2ColorClasses(co2Raw);
  const tempColors = getTemperatureCelsiusColorClasses(tempRaw ?? null);
  const humidityColors = getHumidityColorClasses(humidityRaw ?? null);

  const locationName = sensor.currentLocation?.name ?? 'unassigned';

  // Format relative time for last reading
  const getRelativeTime = (readingTime: string | undefined) => {
    if (!readingTime || readingTime === '--') return 'no data';
    return getRelativeTimeUtil(sensor.lastReading?.readingTime, 'no data');
  };

  return (
    <>
      <div className="border border-airq-dark shadow-card bg-airq-light">
        {/* Header with location name */}
        <div className={`bg-airq-dark text-airq-light flex items-center justify-between ${compact ? 'px-3 py-2' : 'px-2 py-1'}`}>
          <span className={`font-semibold truncate ${compact ? 'text-sm' : 'text-xs'}`}>{locationName}</span>
          <span className={compact ? 'text-xs text-airq-light/60' : 'text-[10px] text-airq-light/60'}>{getRelativeTime(lastReading)}</span>
        </div>

        {/* Metrics row with sparklines */}
        <div className="flex divide-x divide-airq-dark/30">
          <div className={`flex-1 min-w-0 text-center overflow-hidden ${compact ? 'px-3 py-3' : 'px-2 py-1.5'} ${co2Colors.inner}`}>
            <p className={compact ? 'text-xs uppercase tracking-wide text-airq-dark/60' : 'text-[10px] uppercase'}>co2</p>
            <p className={compact ? 'text-lg font-semibold leading-tight' : 'text-sm font-medium'}>
              {co2Raw !== null ? (
                <AnimatedNumber value={co2Raw} />
              ) : (
                co2
              )}
              <span className={compact ? 'text-xs ml-0.5' : 'text-[10px]'}>ppm</span>
            </p>
            <Sparkline
              data={co2Data}
              color={SPARKLINE_COLORS.co2}
              loading={sparklineLoading}
              onClick={() => openModal('co2')}
            />
          </div>
          <div className={`flex-1 min-w-0 text-center overflow-hidden ${compact ? 'px-3 py-3' : 'px-2 py-1.5'} ${tempColors.inner}`}>
            <p className={compact ? 'text-xs uppercase tracking-wide text-airq-dark/60' : 'text-[10px] uppercase'}>temp</p>
            <p className={compact ? 'text-lg font-semibold leading-tight' : 'text-sm font-medium'}>
              {tempRaw !== null && tempRaw !== undefined ? (
                <AnimatedNumber value={tempRaw * 9/5 + 32} />
              ) : (
                temperatureFahrenheit
              )}
              <span className={compact ? 'text-xs ml-0.5' : 'text-[10px]'}>f</span>
            </p>
            <Sparkline
              data={temperatureData}
              color={SPARKLINE_COLORS.temperature}
              loading={sparklineLoading}
              onClick={() => openModal('temperature')}
            />
          </div>
          <div className={`flex-1 min-w-0 text-center overflow-hidden ${compact ? 'px-3 py-3' : 'px-2 py-1.5'} ${humidityColors.inner}`}>
            <p className={compact ? 'text-xs uppercase tracking-wide text-airq-dark/60' : 'text-[10px] uppercase'}>hum</p>
            <p className={compact ? 'text-lg font-semibold leading-tight' : 'text-sm font-medium'}>
              {humidityRaw !== null && humidityRaw !== undefined ? (
                <AnimatedNumber value={humidityRaw} />
              ) : (
                humidity
              )}
              <span className={compact ? 'text-xs ml-0.5' : 'text-[10px]'}>%</span>
            </p>
            <Sparkline
              data={humidityData}
              color={SPARKLINE_COLORS.humidity}
              loading={sparklineLoading}
              onClick={() => openModal('humidity')}
            />
          </div>
        </div>
      </div>

      {/* Expanded Chart Modal */}
      {modalMetric && (
        <SparklineModal
          isOpen={!!modalMetric}
          onClose={closeModal}
          metric={modalMetric}
          sensorId={sensor.id}
          sensorName={sensor.name}
        />
      )}
    </>
  );
});

CompactSensorCard.displayName = 'CompactSensorCard';

interface SensorSidebarProps {
  compact?: boolean;
}

const SensorSidebar: React.FC<SensorSidebarProps> = memo(({ compact = false }) => {
  const sidebarPollInterval = useAdaptivePollInterval(120_000, 30_000);
  const { sensors, loading } = useSensors({
    fetchPolicy: 'cache-and-network',
    pollInterval: sidebarPollInterval,
  });

  // Filter to only show active sensors with locations
  const activeSensors = sensors?.filter(s => s.isActive) ?? [];

  const outerClass = compact
    ? 'w-full flex-shrink-0 bg-airq-light/50 flex flex-col'
    : 'w-full sm:w-56 flex-shrink-0 bg-airq-light/80 sm:bg-airq-light/50 flex flex-col';

  const innerPadding = compact ? 'p-3 space-y-3' : 'p-3 space-y-3';
  const headingClass = compact
    ? 'text-sm font-semibold text-airq-dark/70 uppercase tracking-wide'
    : 'text-xs font-semibold text-airq-dark/70 uppercase tracking-wide';

  if (loading && !sensors?.length) {
    return (
      <div className={compact ? 'w-full flex-shrink-0 bg-airq-light/50' : 'w-full sm:w-56 flex-shrink-0 bg-airq-light/80 sm:bg-airq-light/50'}>
        <div className={innerPadding}>
          <div className={compact ? 'text-sm font-semibold text-airq-dark/30 uppercase tracking-wide' : 'text-xs font-semibold text-airq-dark/30 uppercase tracking-wide'}>
            Air Quality
          </div>
          {[1, 2].map((i) => (
            <CompactSensorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={outerClass}>
      {/* Sensor cards list */}
      <div className={`flex-1 overflow-y-auto ${innerPadding}`}>
        {/* CO2 Sensors Section */}
        {activeSensors.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-airq-dark/60">no active sensors</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className={headingClass}>
              Air Quality
            </div>
            {activeSensors.map((sensor) => (
              <CompactSensorCard key={sensor.id} sensor={sensor} compact={compact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

SensorSidebar.displayName = 'SensorSidebar';

export default SensorSidebar;
