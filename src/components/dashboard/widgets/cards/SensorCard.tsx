import React, { memo, useState, useCallback } from 'react';
import type { Sensor } from '~/types/sensors';
import {
  getCO2ColorClasses,
  getTemperatureCelsiusColorClasses,
  getHumidityColorClasses
} from '~/utils/thresholds';
import { formatSensorDetails } from '~/utils/sensorFormatters';
import Sparkline from '~/components/common/Sparkline';
import SparklineModal, { type SparklineMetric } from '~/components/common/SparklineModal';
import { useSparklineData } from '~/hooks/useSparklineData';

// Sparkline colors matching the chart colors
const SPARKLINE_COLORS = {
  co2: 'rgb(34, 197, 94)',
  temperature: 'rgb(59, 130, 246)',
  humidity: 'rgb(168, 85, 247)',
} as const;

interface SensorCardProps {
  sensor: Sensor | null;
}

const SensorCard: React.FC<SensorCardProps> = memo(({ sensor }) => {
  const [modalMetric, setModalMetric] = useState<SparklineMetric | null>(null);

  const {
    co2Data,
    temperatureData,
    humidityData,
    co2Trend,
    temperatureTrend,
    humidityTrend,
    loading: sparklineLoading,
  } = useSparklineData(sensor?.id);

  const openModal = useCallback((metric: SparklineMetric) => {
    setModalMetric(metric);
  }, []);

  const closeModal = useCallback(() => {
    setModalMetric(null);
  }, []);

  // Show loading state if sensor data isn't available yet
  if (!sensor) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-airq-light">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  const {
    co2,
    co2Raw,
    humidity,
    humidityRaw,
    temp,
    tempRaw,
    temperatureFahrenheit,
  } = formatSensorDetails(sensor);

  // Get color classes for each metric
  const co2Colors = getCO2ColorClasses(co2Raw);
  const tempColors = getTemperatureCelsiusColorClasses(tempRaw ?? null);
  const humidityColors = getHumidityColorClasses(humidityRaw ?? null);

  return (
    <>
      <div className="h-full w-full flex flex-col overflow-hidden bg-airq-light">
        <div aria-label="latest-reading" className="h-full flex justify-evenly">
          {/* CO2 Section */}
          <div className={`flex flex-col justify-center items-center flex-grow px-2 py-1 ${co2Colors.inner}`}>
            <p className="text-md">{co2}ppm</p>
            <Sparkline
              data={co2Data}
              color={SPARKLINE_COLORS.co2}
              loading={sparklineLoading}
              trend={co2Trend}
              onClick={() => openModal('co2')}
            />
          </div>

          <div className="w-[1px] bg-airq-dark" />

          {/* Temperature Section */}
          <div className={`flex flex-col justify-center items-center flex-grow px-2 py-1 ${tempColors.inner}`}>
            <p className="text-md">{temperatureFahrenheit}f/{temp}c</p>
            <Sparkline
              data={temperatureData}
              color={SPARKLINE_COLORS.temperature}
              loading={sparklineLoading}
              trend={temperatureTrend}
              onClick={() => openModal('temperature')}
            />
          </div>

          <div className="w-[1px] bg-airq-dark" />

          {/* Humidity Section */}
          <div className={`flex flex-col justify-center items-center flex-grow px-2 py-1 ${humidityColors.inner}`}>
            <p className="text-md">hum {humidity}%</p>
            <Sparkline
              data={humidityData}
              color={SPARKLINE_COLORS.humidity}
              loading={sparklineLoading}
              trend={humidityTrend}
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

SensorCard.displayName = 'SensorCard';

export default SensorCard;
