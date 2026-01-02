import React, {
  memo,
} from 'react';
import type { Sensor } from '~/types/sensors';
import {
  getCO2ColorClasses,
  getTemperatureCelsiusColorClasses,
  getHumidityColorClasses
} from '~/utils/thresholds';
import { formatSensorDetails } from '~/utils/sensorFormatters';

interface SensorCardProps {
  sensor: Sensor | null;
}

const SensorCard: React.FC<SensorCardProps> = memo(({ sensor }) => {
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
    <div className="h-full w-full flex flex-col overflow-hidden bg-airq-light">
      <div aria-label="latest-reading" className="h-full flex justify-evenly">
        <div className={`flex justify-center items-center flex-grow ${co2Colors.inner}`}>
          <p className="text-md">{co2}ppm</p>
        </div>
        <div className="w-[1px] bg-airq-dark" />
        <div className={`flex justify-center items-center flex-grow ${tempColors.inner}`}>
          <p className="text-md">{temperatureFahrenheit}f/{temp}c</p>
        </div>
        <div className="w-[1px] bg-airq-dark" />
        <div className={`flex justify-center items-center flex-grow ${humidityColors.inner}`}>
          <p className="text-md">hum {humidity}%</p>
        </div>
      </div>
    </div>
  );
});

SensorCard.displayName = 'SensorCard';

export default SensorCard;