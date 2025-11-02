import React, { memo } from 'react';
import MultiMetricChart from '../charts/MultiMetricChart';

type MultiMetricChartWrapperProps = Record<string, unknown>;

const MultiMetricChartWrapper: React.FC<MultiMetricChartWrapperProps> = memo(() => {
  return <MultiMetricChart />;
});

MultiMetricChartWrapper.displayName = 'MultiMetricChartWrapper';

export default MultiMetricChartWrapper;