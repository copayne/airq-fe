import React, { Suspense } from 'react';
import Layout from '../layout/Layout';
import DashboardCanvas from './DashboardCanvas';

const AirQualityDashboard = () => {
  return (
    <Layout>
      <div id="air-quality-dashboard-container" className="h-full flex justify-center p-2 md:p-4">
        <div className="w-full md:max-w-[80%] bg-airq-light/95 rounded border-airq-dark border">
          <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Dashboard...</div>}>
            <DashboardCanvas />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
};

export default AirQualityDashboard;