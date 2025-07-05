import React from 'react';
import SensorCard from '../cards/SensorCard';

interface SensorCardWrapperProps {
  sensorId?: string;
  [key: string]: unknown;
}

const SensorCardWrapper: React.FC<SensorCardWrapperProps> = ({ sensorId = "1", ..._otherProps }) => {
  return <SensorCard sensorId={sensorId} />;
};

export default SensorCardWrapper;