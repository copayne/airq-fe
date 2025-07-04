import React, { Suspense } from 'react';
import Layout from '../layout/Layout';
import DashboardCanvas from './DashboardCanvas';

const AirQualityDashboard = () => {
  return (
    <Layout>
      <div id="air-quality-dashboard-container" className="flex flex-col h-full-no-header p-4">
        <Suspense fallback={<div>Loading Dashboard...</div>}>
          <DashboardCanvas />
        </Suspense>
      </div>
    </Layout>
  );
};

export default AirQualityDashboard;