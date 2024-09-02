import React from 'react';
import { Sensor as SensorData } from '~/hooks/useSensorData';

interface SensorCardProps {
  sensor: SensorData;
}

const StatusIndicator = ({ isSuccess }) => (
  <div 
    className={`w-[10px] h-[10px] rounded-full mr-3 relative ${
      isSuccess ? 'bg-green-500' : 'bg-red-500'
    }`}
    style={{
      boxShadow: `0 0 6px 1px ${isSuccess ? '#4ade80' : '#ef4444'}`,
      backgroundImage: 'radial-gradient(circle at 33% 33%, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.1) 100%)',
    }}
  >
  <div 
    className="absolute inset-0 rounded-full"
    style={{
      background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)',
      opacity: 0.4,
    }}
  />
  </div>
);

const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {
  const {
    id,
    currentLocation,
    isActive,
    lastReading,
  } = sensor;
  const co2 = lastReading.co2Reading?.co2Ppm ?? '--';
  const humidity = lastReading.humidityReading?.humidityPercentage
    ? lastReading.humidityReading.humidityPercentage.toFixed(1)
    : '--';
  const temp = lastReading.temperatureReading?.temperatureCelsius;
  const tempCelsius = temp
    ? temp.toFixed(0)
    : '--';
  const temperatureFahrenheit = temp
    ? ((temp * 9) / 5 + 32).toFixed(0)
    : '--';

  return (
    <div className="bg-neutral-300 text-neutral-800 shadow-md rounded-sm m-2 w-60">
      <div className="flex flex-col justify-between">
        <div className="mb-4 pl-4 pt-2 pr-4">
          <div className="flex items-center">
            <StatusIndicator isSuccess={lastReading.isSuccess} />
          <h3 className="text-2xl font-light">{currentLocation.name}</h3>
          </div>
          <p className="mb-2 ml-6 text-xs font-light">{new Date(lastReading.readingTime).toLocaleString()}</p>
        </div>
        <div className="flex justify-evenly h-5">
          <div className={`flex justify-center items-center flex-grow bg-green-700 ${co2 === '--' ? 'bg-gray-500' : ''} ${(co2 > 800 && co2 < 1000) ? 'bg-yellow-400' : ''}  ${co2 > 1000 ? 'bg-red-600' : ''}`}>
            <p className="text-xs">{co2}ppm</p>
          </div>
          <div className="w-[1px] bg-gray-800" />
          <div className={`flex justify-center items-center flex-grow bg-green-700 ${!temp ? 'bg-gray-500' : ''} ${(temp > 75 && temp < 82) ? 'bg-yellow-400' : ''}  ${temp > 82 ? 'bg-red-600' : ''}`}>
            <p className="text-xs">{temperatureFahrenheit}f/{tempCelsius}c</p>
          </div>
          <div className="w-[1px] h-full bg-gray-800" />
          <div className={`flex justify-center items-center flex-grow bg-green-700 ${humidity === '--' ? 'bg-gray-500' : ''} ${((humidity > 25 && humidity < 30) || (humidity > 60 && humidity < 70)) ? 'bg-yellow-400' : ''}  ${humidity > 70 || humidity < 25 ? 'bg-red-600' : ''}`}>
            <p className="text-xs">hum {humidity}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;