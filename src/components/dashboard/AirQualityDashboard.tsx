import React, {
  Suspense,
  useCallback,
  useMemo,
  useState,
} from 'react';
import SensorGrid from './SensorGrid';
import SensorReadingTable from '../tables/SensorReadingTable';
import Layout from '../layout/Layout';
import { useSensorReadingData } from '~/hooks/useSensorReadingData';

const TABLE_VIEW = 'TABLE_VIEW';

const INFO_VIEW_COMPONENTS_CHOOSER = {
  [TABLE_VIEW]: SensorReadingTable,
};

const AirQualityDashboard = () => {
  const [infoView, setInfoView] = useState(TABLE_VIEW);

  const toggleTableView = useCallback(() => setInfoView(TABLE_VIEW), []);

  const InfoComponent = useMemo(() => {
    return INFO_VIEW_COMPONENTS_CHOOSER[infoView];
  }, [infoView]);

  return (
    <Layout>
      <div id="air-quality-dashboard-container" className="flex flex-nowrap h-full-no-header p-8 justify-center">
        <SensorGrid />
        <div id="grid-separator" className="h-auto w-[1px] bg-default-dark ml-8 mr-8" />
        <Suspense fallback={<div>Loading Dashboard...</div>}>
          <div className="flex flex-1 flex-col max-w-screen-2xl">
            <div id="tab-switch-container" className="flex">
              <div
                aria-label="table view button"
                className={`border-default-dark border-[1px] w-fit pl-3 pr-3 border-b-0 rounded-ss-lg text-lg cursor-pointer ${infoView === TABLE_VIEW ? 'bg-default-contrast text-default-textLight' : 'bg-default-light hover:bg-neutral-700/50'}`}
                onClick={toggleTableView}
                role="button"
                tabIndex={1}
              >
                table
              </div>
              <div
                aria-label="chart view button"
                className={`border-default-dark border-[1px] border-l-0 w-fit pl-3 pr-3 border-b-0 rounded-se-lg text-lg cursor-pointer shadow-card shadow-default-dark bg-default-light hover:bg-neutral-700/50`}
                role="button"
                tabIndex={2}
              >
                charts
              </div>
            </div>
            <div id="dashboard-container" className="flex-1 bg-default-textLight z-10 h-full pb-8">
              <InfoComponent />
            </div>
          </div>
        </Suspense>
      </div>
    </Layout>
  );
};

export default AirQualityDashboard;