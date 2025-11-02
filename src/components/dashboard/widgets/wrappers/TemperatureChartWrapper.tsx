import React, { memo } from 'react';
import TemperatureChart from '../charts/TemperatureChart';

type TemperatureChartWrapperProps = Record<string, unknown>;

const TemperatureChartWrapper: React.FC<TemperatureChartWrapperProps> = memo(() => {
  return <TemperatureChart />;
});

TemperatureChartWrapper.displayName = 'TemperatureChartWrapper';

export default TemperatureChartWrapper;