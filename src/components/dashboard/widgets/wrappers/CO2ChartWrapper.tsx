import React from 'react';
import CO2Chart from '../charts/CO2Chart';

type CO2ChartWrapperProps = Record<string, unknown>;

const CO2ChartWrapper: React.FC<CO2ChartWrapperProps> = ({ ..._otherProps }) => {
  return <CO2Chart />;
};

export default CO2ChartWrapper;