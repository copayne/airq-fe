import React, {
  ReactNode,
} from 'react';

interface DashboardGridProps {
  children: ReactNode;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  return (
    <div id="dashboard-grid" className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols3 gap-6 bg-default-textLight/20 rounded-sm shadow-lg backdrop-blur-sm ring-1 ring-black/5 m-2 p-6 max-w-screen-2xl">
      {children}
    </div>
  );
};

export default DashboardGrid;
