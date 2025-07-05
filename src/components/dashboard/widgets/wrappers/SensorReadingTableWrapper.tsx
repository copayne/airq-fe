import React from 'react';

const SensorReadingTableLazy = React.lazy(() => 
  Promise.all([
    import('@tanstack/react-table'),
    import('../tables/SensorReadingTable')
  ]).then(([_, component]) => ({
    default: component.default
  }))
);

interface SensorReadingTableWrapperProps {
  display?: boolean;
  [key: string]: unknown;
}

const SensorReadingTableWrapper: React.FC<SensorReadingTableWrapperProps> = ({ display: _display = true, ..._otherProps }) => {
  return <SensorReadingTableLazy />;
};

export default SensorReadingTableWrapper;