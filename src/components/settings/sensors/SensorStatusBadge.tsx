import React from 'react';

interface SensorStatusBadgeProps {
  isActive: boolean;
  showLabel?: boolean;
}

export const SensorStatusBadge: React.FC<SensorStatusBadgeProps> = ({
  isActive,
  showLabel = true
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${
        isActive
          ? 'bg-airq-primary/10 text-airq-primary border-airq-primary/30'
          : 'bg-airq-dark/5 text-airq-dark/60 border-airq-dark/20'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 ${
          isActive ? 'bg-airq-primary' : 'bg-airq-dark/40'
        }`}
      />
      {showLabel && (isActive ? 'active' : 'inactive')}
    </span>
  );
};

export default SensorStatusBadge;
