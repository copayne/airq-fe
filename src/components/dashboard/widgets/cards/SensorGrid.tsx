import React, {
  memo,
  Suspense,
} from 'react';
import { useSensorData } from '~/hooks/useSensorData';
import SensorCard from './SensorCard';

const SensorGrid: React.FC = memo(() => {
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
      <div id="sensor-grid" className="w-full md:w-80 md:min-w-80 flex flex-row md:flex-col gap-4 p-4 pt-8 overflow-x-auto md:overflow-x-visible">
        {sensors?.map(sensor => (
          <div key={sensor.id} className="h-36 w-64 md:w-auto flex-shrink-0">
            <SensorCard
              sensor={sensor}
            />
          </div>
        ))}
      </div>
    </Suspense>
  );
});

SensorGrid.displayName = 'SensorGrid';

export default SensorGrid;
