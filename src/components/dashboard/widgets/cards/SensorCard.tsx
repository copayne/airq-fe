import React, {
  memo,
  useMemo,
} from 'react';
import { type Sensor, useSensorData } from '~/hooks/useSensorData';

interface SensorCardProps {
  sensorId: string
}

const StatusIndicator = ({ isActive }: { isActive: boolean }) => (
  <div 
    className={`w-[10px] h-[10px] rounded-full mr-3 relative border-airq-dark border-[1px] ${
      isActive ? 'bg-airq-primary' : 'bg-airq-tertiary'
    }`}
    title={isActive ? 'online' : 'offline'}
  />
);

const getSensorDetails = (sensor: Sensor | undefined) => {
  if (!sensor) {
    return {
      co2: 0,
      currentLocation: '',
      humidity: 0,
      lastReading: '',
      temp: 0,
      temperatureFahrenheit: 0,
    };
  }

  const lastReading = sensor.lastReading;
  const co2 = lastReading?.co2Reading?.co2Ppm ?? '--';
  const humidityRaw = lastReading?.humidityReading?.humidityPercentage;
  const humidity = humidityRaw
    ? humidityRaw.toFixed(1)
    : '--';
  const temp = lastReading?.temperatureReading?.temperatureCelsius;
  const temperatureFahrenheit = temp
    ? ((temp * 9) / 5 + 32).toFixed(0)
    : '--';

  return {
    co2,
    currentLocation: sensor.currentLocation.name.toLowerCase(),
    humidity,
    humidityRaw: humidityRaw ?? 0,
    isActive: lastReading.isSuccess,
    lastReading: new Date(lastReading.readingTime).toLocaleString(),
    temp: temp ? temp.toFixed(1) : '--',
    tempRaw: temp ?? 0,
    temperatureFahrenheit
  }
}

const SensorCard: React.FC<SensorCardProps> = memo(({ sensorId }) => {
  const {
    sensors,
  } = useSensorData();
  const sensor = useMemo(() => sensors?.find(s => s.id === sensorId), [sensorId, sensors]);
  const {
    co2,
    currentLocation,
    humidity,
    humidityRaw,
    isActive,
    temp,
    tempRaw,
    temperatureFahrenheit,
  } = getSensorDetails(sensor);

  return !!sensor && (
    <div aria-label="sensor-card-container" className="flex flex-col justify-between h-full bg-airq-light">
      <div className="flex flex-col w-full pr-2 pl-2">
        <div aria-label="id-status-container" className="flex items-center w-full justify-between pt-2">
          <div className="text-xs underline">
            id#{sensor.id}
          </div>
          <StatusIndicator isActive={isActive ?? false} />
        </div>
        <div aria-label="sensor-name">
          <h3 className="text-3xl font-light">{currentLocation}</h3>
        </div>
      </div>
      <div aria-label="latest-reading" className="flex justify-evenly border-t-[1px] border-airq-dark">
        <div className={`rounded-bl-sm flex justify-center items-center flex-grow ${co2 <= 800 ? 'bg-airq-primary text-airq-light' : ''} ${(co2 > 800 && co2 < 1000) ? 'bg-airq-secondary text-airq-dark' : ''}  ${co2 >= 1000 ? 'bg-airq-tertiary' : ''}`}>
          <p className="text-md">{co2}ppm</p>
        </div>
        <div className="w-[1px] bg-airq-dark" />
        <div className={`flex justify-center items-center flex-grow  ${(tempRaw ?? 0) < 20 ? 'bg-airq-primary text-airq-light' : ''} ${((tempRaw ?? 0) > 20 && (tempRaw ?? 0) < 27) ? 'bg-airq-secondary text-airq-dark' : ''}  ${(tempRaw ?? 0) > 27 ? 'bg-airq-tertiary' : ''}`}>
          <p className="text-md">{temperatureFahrenheit}f/{temp}c</p>
        </div>
        <div className="w-[1px] bg-airq-dark" />
        <div className={`rounded-br-sm flex justify-center items-center flex-grow ${((humidityRaw ?? 0) > 30 && (humidityRaw ?? 0) < 60) ? 'bg-airq-primary text-airq-light' : ''} ${(((humidityRaw ?? 0) > 25 && (humidityRaw ?? 0) < 30) || ((humidityRaw ?? 0) > 60 && (humidityRaw ?? 0) < 70)) ? 'bg-airq-secondary' : ''}  ${(humidityRaw ?? 0) > 70 || (humidityRaw ?? 0) < 25 ? 'bg-airq-tertiary' : ''}`}>
          <p className="text-md">hum {humidity}%</p>
        </div>
      </div>
    </div>
  )
});

SensorCard.displayName = 'SensorCard';

export default SensorCard;