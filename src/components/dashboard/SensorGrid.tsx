import React, {
  ReactNode,
  Suspense,
} from 'react';
import { useSensorData } from '~/hooks/useSensorData';
import SensorCard from '../cards/SensorCard';

const SensorGrid: React.FC = () => {
  const {
    error,
    loading,
    sensors,
  } = useSensorData();

  if (loading) return (
    <div className="flex flex-wrap bg-white/30 shadow-md mt-4 mb-4 p-6 mx-auto">
      <p>Loading sensors...</p>
    </div>
  );

  if (error) return <p>Error: {error.message}</p>;

  return (
    <Suspense fallback={<div>Loading Sensors...</div>}>
      <div id="sensor-grid" className="flex flex-col flex-wrap justify-center bg-default-textLight/20 rounded-sm shadow-lg backdrop-blur-sm ring-1 ring-black/5 m-2">
        {sensors?.map(sensor => <SensorCard sensor={sensor} />)}
      </div>
    </Suspense>
  );
};

export default SensorGrid;
