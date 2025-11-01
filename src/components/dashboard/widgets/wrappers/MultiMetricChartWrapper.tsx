import React from 'react';
import MultiMetricChart from '../charts/MultiMetricChart';

type MultiMetricChartWrapperProps = Record<string, unknown>;

const MultiMetricChartWrapper: React.FC<MultiMetricChartWrapperProps> = ({ ..._otherProps }) => {
  return <MultiMetricChart />;
};

export default MultiMetricChartWrapper;