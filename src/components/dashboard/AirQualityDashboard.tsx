import React, {
  Suspense,
  useMemo,
  useState,
} from 'react';
import { useQuery } from '@apollo/client';
import dynamic from 'next/dynamic';
import Layout from '../layout/Layout';
import { GET_SENSOR_READINGS } from '../../graphql/SensorReading';

const DashboardGrid = dynamic(() => import ('../dashboard/DashboardGrid'), {
  loading: () => <p>Loading dashboard...</p>
});

const AirQualityDashboard = () => {
  const { data: sensorReadings } = useQuery(GET_SENSOR_READINGS);
  console.log(sensorReadings);
  // const sensorData = useSensorData();

  // const memoizedSensorCards = useMemo(() => sensorData
  //   .map(sensor => <SensorCard key={sensor.id} {...sensor} />),
  //   [sensorData]
  // );

  return (
    <Layout>
      <div id="sensor-grid">
        To-do
      </div>
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <DashboardGrid>
          {/* Add data tables and visualizations here */}
          <div>
            Dashboard elements to come here...
          </div>
        </DashboardGrid>
      </Suspense>
    </Layout>
  );
};

export default AirQualityDashboard;