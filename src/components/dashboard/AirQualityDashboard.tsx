import { Suspense } from 'react';
import Layout from '../layout/Layout';
import DashboardCanvas from './DashboardCanvas';
import SensorSidebar from './SensorSidebar';
import { DashboardLayoutProvider } from '~/context/DashboardLayoutContext';

const AirQualityDashboard = () => {
  return (
    <Layout>
      <DashboardLayoutProvider>
        <div id="air-quality-dashboard-container" className="h-full flex justify-center px-6 py-2 md:px-12 md:py-4">
          <div className="max-w-[250px] bg-airq-light/95 mr-2 rounded border-airq-dark border pt-3">
            {/* Sensor Sidebar */}
            <SensorSidebar />
          </div>
          <div className="w-full max-w-[1700px] h-full bg-airq-light/95 rounded border-airq-dark border flex overflow-hidden">
            {/* Main Dashboard */}
            <div className="flex-1 flex flex-col min-w-0">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Dashboard...</div>}>
                <DashboardCanvas />
              </Suspense>
            </div>
          </div>
        </div>
      </DashboardLayoutProvider>
    </Layout>
  );
};

export default AirQualityDashboard;