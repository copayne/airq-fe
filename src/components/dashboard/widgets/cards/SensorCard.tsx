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
  sensor: Sensor;
}

const SensorCard: React.FC<SensorCardProps> = memo(({ sensor }) => {
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

  return !!sensor && (
    <div className="h-full w-full border-black border-[1px] shadow-airq-dark shadow-card flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div aria-label="sensor-card-container" className="flex flex-col justify-between h-full bg-airq-light">
          <div aria-label="latest-reading" className="h-full flex justify-evenly border-t-[1px] border-airq-dark">
            <div className={`rounded-bl-sm flex justify-center items-center flex-grow ${co2Colors.inner}`}>
              <p className="text-md">{co2}ppm</p>
            </div>
            <div className="w-[1px] bg-airq-dark" />
            <div className={`flex justify-center items-center flex-grow ${tempColors.inner}`}>
              <p className="text-md">{temperatureFahrenheit}f/{temp}c</p>
            </div>
            <div className="w-[1px] bg-airq-dark" />
            <div className={`rounded-br-sm flex justify-center items-center flex-grow ${humidityColors.inner}`}>
              <p className="text-md">hum {humidity}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
});

SensorCard.displayName = 'SensorCard';

export default SensorCard;