import React, { memo } from 'react';
import CO2Chart from '../charts/CO2Chart';

type CO2ChartWrapperProps = Record<string, unknown>;

const CO2ChartWrapper: React.FC<CO2ChartWrapperProps> = memo(() => {
  return <CO2Chart />;
});

CO2ChartWrapper.displayName = 'CO2ChartWrapper';

export default CO2ChartWrapper;