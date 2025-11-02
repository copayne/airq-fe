import React, { memo } from 'react';
import MetricsCard from '../cards/MetricsCard';

const MetricsCardWrapper: React.FC<Record<string, unknown>> = memo(() => {
  return <MetricsCard />;
});

MetricsCardWrapper.displayName = 'MetricsCardWrapper';

export default MetricsCardWrapper;
