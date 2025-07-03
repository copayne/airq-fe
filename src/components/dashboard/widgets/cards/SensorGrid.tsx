import React, {
  Suspense,
} from 'react';
import { useSensorData } from '~/hooks/useSensorData';
import SensorCard from './SensorCard';

const SensorGrid: React.FC = () => {
  const {
    error,
    isFetched,
    loading,
    sensors,
  } = useSensorData();

  if (!isFetched && loading) return (
    <div className="flex flex-wrap bg-white/30 shadow-md mt-4 mb-4 p-6 mx-auto">
      <p>Loading sensors...</p>
    </div>
  );

  if (error) return <p>Error: {error.message}</p>;

  return (
    <Suspense fallback={<div>Loading Sensors...</div>}>
      <div id="sensor-grid" className="flex flex-col flex-wrap">
        {sensors?.map(sensor => (
          <SensorCard
            key={sensor.id}
            sensorId={sensor.id}
          />
        ))}
      </div>
    </Suspense>
  );
};

export default SensorGrid;
