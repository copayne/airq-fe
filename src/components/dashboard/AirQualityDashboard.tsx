import React, {
  Suspense,
} from 'react';
import dynamic from 'next/dynamic';
import SensorGrid from './SensorGrid';
import Layout from '../layout/Layout';
import { useSensorReadingData } from '~/hooks/useSensorReadingData';

const DashboardGrid = dynamic(() => import ('../dashboard/DashboardGrid'), {
  loading: () => <p>Loading dashboard...</p>
});

const AirQualityDashboard = () => {
  const {
    error,
    loading,
    sensorReadings,
    updateCriteria,
  } = useSensorReadingData();

  if (error) return <p>Error: {error.message}</p>;


  return (
    <Layout>
      <div className="flex flex-nowrap justify-center">
        <SensorGrid />
        <Suspense fallback={<div>Loading Dashboard...</div>}>
          <DashboardGrid>
            To-do dashboard...
          </DashboardGrid>
        </Suspense>
      </div>
    </Layout>
  );
};

export default AirQualityDashboard;