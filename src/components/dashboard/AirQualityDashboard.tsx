import React, {
  Suspense,
  useMemo,
  useState,
} from 'react';
import { useQuery } from '@apollo/client';
import dynamic from 'next/dynamic';
import Layout from '../layout/Layout';
import { GET_SENSORS } from '../../graphql/Sensor';
import { useSensorData } from '~/hooks/useSensorData';
import Heatmap, { formatHeatmapData } from '../charts/Heatmap';
import LineChart from '../charts/LineChart';
import { useSensorDataContext } from '~/context/SensorDataContext';

const DashboardGrid = dynamic(() => import ('../dashboard/DashboardGrid'), {
  loading: () => <p>Loading dashboard...</p>
});

const AirQualityDashboard = () => {
  const {
    error,
    loading,
    sensorReadings,
    updateCriteria,
  } = useSensorData();
  const { data: sensorData } = useQuery(GET_SENSORS);
  const { state } = useSensorDataContext();
  const { criteria } = state;
  console.log(criteria);
  console.log(sensorReadings);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;


  const series = !!sensorData && !!sensorReadings
    ? formatHeatmapData(sensorData.sensors, sensorReadings)
    : [];

  const handleUpdateCriteria = () => updateCriteria({ maxCO2: 700 });

  return (
    <Layout>
      <div id="sensor-grid">
        To-do
      </div>
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <DashboardGrid>
          {/* Add data tables and visualizations here */}
          <div>
            <LineChart />
            <Heatmap series={series} />
          </div>
          <div>
            <button onClick={handleUpdateCriteria}>
              Test button
            </button>
          </div>
        </DashboardGrid>
      </Suspense>
    </Layout>
  );
};

export default AirQualityDashboard;