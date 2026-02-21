import { Suspense } from 'react';
import Layout from '../layout/Layout';
import DashboardCanvas from './DashboardCanvas';
import SensorSidebar from './SensorSidebar';
import { DashboardLayoutProvider } from '~/context/DashboardLayoutContext';

interface AirQualityDashboardProps {
  /** When true, uses compact spacing optimized for tablet displays. */
  compact?: boolean;
  /** When true, skips the Layout wrapper (caller provides its own). */
  bare?: boolean;
}

const AirQualityDashboard = ({ compact = false, bare = false }: AirQualityDashboardProps) => {
  const containerClass = compact
    ? 'h-full flex flex-row justify-center px-2 py-2 gap-2'
    : 'h-full flex justify-center sm:px-6 sm:py-2 md:px-12 md:py-4';

  const sidebarClass = compact
    ? 'w-[280px] h-full overflow-hidden flex-shrink-0 bg-airq-light/95 rounded border-airq-dark border pt-2'
    : 'w-full h-full overflow-hidden sm:max-w-[250px] sm:bg-airq-light/95 sm:mr-2 sm:rounded sm:border-airq-dark sm:border pt-3';

  const canvasContainerClass = compact
    ? 'flex w-full h-full bg-airq-light/95 rounded border-airq-dark border overflow-hidden'
    : 'hidden sm:flex w-full max-w-[1700px] h-full bg-airq-light/95 rounded border-airq-dark border overflow-hidden';

  const content = (
    <DashboardLayoutProvider>
      <div id="air-quality-dashboard-container" className={containerClass}>
        <div className={sidebarClass}>
          <SensorSidebar compact={compact} />
        </div>
        <div className={canvasContainerClass}>
          <div className="flex-1 flex flex-col min-w-0">
            <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Dashboard...</div>}>
              <DashboardCanvas compact={compact} />
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardLayoutProvider>
  );

  if (bare) return content;
  return <Layout>{content}</Layout>;
};

export default AirQualityDashboard;
