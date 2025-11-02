import React from 'react';
import SensorCard from '../cards/SensorCard';
import { type Sensor } from '~/hooks/useSensorData';

interface SensorCardWrapperProps {
  sensor: Sensor;
  [key: string]: unknown;
}

const SensorCardWrapper: React.FC<SensorCardWrapperProps> = ({ sensor, ..._otherProps }) => {
  return <SensorCard sensor={sensor} />;
};

export default SensorCardWrapper;