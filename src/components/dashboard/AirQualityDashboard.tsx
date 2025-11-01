import { Suspense } from 'react';
import Layout from '../layout/Layout';
import DashboardCanvas from './DashboardCanvas';

const AirQualityDashboard = () => {
  return (
    <Layout>
      <div id="air-quality-dashboard-container" className="h-full flex justify-center px-6 py-2 md:px-12 md:py-4">
        <div className="w-full max-w-[2100px] h-full bg-airq-light/95 rounded border-airq-dark border flex flex-col">
          <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Dashboard...</div>}>
            <DashboardCanvas />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
};

export default AirQualityDashboard;