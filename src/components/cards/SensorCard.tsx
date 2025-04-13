import React from 'react';
import { Sensor as SensorData } from '~/hooks/useSensorData';

interface SensorCardProps {
  sensor: SensorData;
}

const StatusIndicator = ({ isSuccess }) => (
  <div 
    className={`w-[10px] h-[10px] rounded-full mr-3 relative border-default-textDark border-[1px] ${
      isSuccess ? 'bg-status-good' : 'bg-status-bad'
    }`}
    title={isSuccess ? 'online' : 'offline'}
  />
);

const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {
  const {
    currentLocation,
    lastReading,
  } = sensor;
  const co2 = lastReading?.co2Reading?.co2Ppm ?? '--';
  const humidity = lastReading?.humidityReading?.humidityPercentage
    ? lastReading.humidityReading.humidityPercentage.toFixed(1)
    : '--';
  const temp = lastReading?.temperatureReading?.temperatureCelsius;
  const tempCelsius = temp
    ? temp.toFixed(0)
    : '--';
  const temperatureFahrenheit = temp
    ? ((temp * 9) / 5 + 32).toFixed(0)
    : '--';

  return (
    <div>
      <div className="bg-default-textLight border-default-dark border-[1px] m-2 mb-0 shadow-default-dark shadow-card w-fit pl-2 pr-2 border-b-0 rounded-ss-md rounded-se-md text-xs">
        id#{sensor.id}
      </div>
      <div className="bg-default-textLight text-default-textDark shadow-default-dark rounded-sm rounded-ss-none border-default-dark border-[1px] m-2 mt-0 w-64 shadow-card">
        <div className="flex flex-col justify-between">
          <div className="mb-3 pl-2 pt-2 pr-2">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-light">{currentLocation.name.toLowerCase()}</h3>
              <StatusIndicator isSuccess={lastReading?.isSuccess} />
            </div>
            <p className="text-sm font-light">{new Date(lastReading?.readingTime).toLocaleString()}</p>
          </div>
          <div className="flex justify-evenly h-8 border-t-[1px] border-default-dark">
            <div className={`rounded-bl-sm flex justify-center items-center flex-grow bg-gray-500/80 ${co2 < 800 ? 'bg-status-good' : ''} ${(co2 > 800 && co2 < 1000) ? 'bg-status-mid text-default-textDark' : ''}  ${co2 > 1000 ? 'bg-status-bad' : ''}`}>
              <p className="text-md">{co2}ppm</p>
            </div>
            <div className="w-[1px] bg-default-dark" />
            <div className={`flex justify-center items-center flex-grow bg-gray-500/80 ${temp < 20 ? 'bg-status-good' : ''} ${(temp > 20 && temp < 27) ? 'bg-status-mid text-default-textDark' : ''}  ${temp > 27 ? 'bg-status-bad' : ''}`}>
              <p className="text-md">{temperatureFahrenheit}f/{tempCelsius}c</p>
            </div>
            <div className="w-[1px] bg-default-dark" />
            <div className={`rounded-br-sm flex justify-center items-center flex-grow bg-gray-500/80 ${(humidity > 30 && humidity < 60) ? 'bg-status-good' : ''} ${((humidity > 25 && humidity < 30) || (humidity > 60 && humidity < 70)) ? 'bg-status-mid' : ''}  ${humidity > 70 || humidity < 25 ? 'bg-status-bad' : ''}`}>
              <p className="text-md">hum {humidity}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default SensorCard;