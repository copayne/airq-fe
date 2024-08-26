import React, {
  ReactNode,
} from 'react';

interface DashboardGridProps {
  children: ReactNode;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols3 gap-6">
      {children}
    </div>
  );
};

export default DashboardGrid;
