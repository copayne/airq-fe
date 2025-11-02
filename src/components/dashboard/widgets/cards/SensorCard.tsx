import React, {
  memo,
} from 'react';
import { type Sensor } from '~/hooks/useSensorData';

interface SensorCardProps {
  sensor: Sensor;
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

const SensorCard: React.FC<SensorCardProps> = memo(({ sensor }) => {
  const {
    co2,
    humidity,
    humidityRaw,
    temp,
    tempRaw,
    temperatureFahrenheit,
  } = getSensorDetails(sensor);

  return !!sensor && (
    <div className="h-full w-full border-black border-[1px] shadow-airq-dark shadow-card flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div aria-label="sensor-card-container" className="flex flex-col justify-between h-full bg-airq-light">
          <div aria-label="latest-reading" className="h-full flex justify-evenly border-t-[1px] border-airq-dark">
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
      </div>
    </div>
  )
});

SensorCard.displayName = 'SensorCard';

export default SensorCard;