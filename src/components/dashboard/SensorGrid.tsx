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

  if (loading) return <p>Loading sensors...</p>; // TODO: create more elegant loading solution
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Suspense fallback={<div>Loading Sensors...</div>}>
      <div id="sensor-grid" className="flex flex-wrap bg-white bg-opacity-60 rounded-md shadow-md mt-4 mb-4 p-6 mx-auto max-w-screen-2xl">
        {sensors?.map(sensor => <SensorCard sensor={sensor} />)}
      </div>
    </Suspense>
  );
};

export default SensorGrid;
