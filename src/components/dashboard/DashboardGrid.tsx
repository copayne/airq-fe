import React, {
  ReactNode,
} from 'react';

interface DashboardGridProps {
  children: ReactNode;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols3 gap-6 bg-white bg-opacity-60 rounded-md shadow-md mt-4 mb-4 p-6 mx-auto max-w-screen-2xl">
      {children}
    </div>
  );
};

export default DashboardGrid;
