import React from 'react';
import TemperatureChart from '../charts/TemperatureChart';

type TemperatureChartWrapperProps = Record<string, unknown>;

const TemperatureChartWrapper: React.FC<TemperatureChartWrapperProps> = ({ ..._otherProps }) => {
  return <TemperatureChart />;
};

export default TemperatureChartWrapper;