import React from 'react';
import MetricsCard from '../cards/MetricsCard';

const MetricsCardWrapper: React.FC<Record<string, unknown>> = ({ ..._otherProps }) => {
  return <MetricsCard />;
};

export default MetricsCardWrapper;
