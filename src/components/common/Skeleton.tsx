import React, { memo } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Base skeleton component for loading states.
 * Provides a pulsing placeholder that matches the shape of content.
 */
export const Skeleton: React.FC<SkeletonProps> = memo(({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true,
}) => {
  const baseClasses = 'bg-airq-dark/10';
  const animateClass = animate ? 'animate-pulse' : '';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={`${baseClasses} ${animateClass} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
});

Skeleton.displayName = 'Skeleton';

/**
 * Skeleton for sensor card metrics
 */
export const SensorCardSkeleton: React.FC = memo(() => (
  <div className="h-full w-full flex flex-col overflow-hidden bg-airq-light">
    <div className="h-full flex justify-evenly">
      {[1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          {i > 1 && <div className="w-[1px] bg-airq-dark/20" />}
          <div className="flex flex-col justify-center items-center flex-grow px-2 py-2 gap-2">
            <Skeleton variant="text" width="60%" height="1.25rem" />
            <Skeleton variant="rectangular" width="80%" height="16px" />
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
));

SensorCardSkeleton.displayName = 'SensorCardSkeleton';

/**
 * Skeleton for compact sensor card in sidebar
 */
export const CompactSensorCardSkeleton: React.FC = memo(() => (
  <div className="border border-airq-dark/20 shadow-card bg-airq-light">
    <div className="bg-airq-dark/20 px-2 py-1 flex items-center justify-between">
      <Skeleton variant="text" width="60%" height="0.75rem" />
      <Skeleton variant="text" width="20%" height="0.625rem" />
    </div>
    <div className="flex divide-x divide-airq-dark/10">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex-1 px-2 py-1.5 text-center space-y-1">
          <Skeleton variant="text" width="50%" height="0.625rem" className="mx-auto" />
          <Skeleton variant="text" width="70%" height="0.875rem" className="mx-auto" />
          <Skeleton variant="rectangular" width="100%" height="16px" />
        </div>
      ))}
    </div>
  </div>
));

CompactSensorCardSkeleton.displayName = 'CompactSensorCardSkeleton';

/**
 * Skeleton for chart widgets
 */
export const ChartSkeleton: React.FC = memo(() => (
  <div className="h-full w-full p-4 flex flex-col">
    <div className="flex-1 flex items-end justify-around gap-1 pb-4">
      {Array.from({ length: 24 }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          width="100%"
          height={`${20 + Math.random() * 60}%`}
          className="rounded-t"
        />
      ))}
    </div>
    <Skeleton variant="text" width="100%" height="1rem" />
  </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';

/**
 * Skeleton for table rows
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = memo(({ columns = 5 }) => (
  <div className="flex items-center gap-4 py-3 px-4 border-b border-airq-dark/10">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === 0 ? '20%' : '15%'}
        height="1rem"
      />
    ))}
  </div>
));

TableRowSkeleton.displayName = 'TableRowSkeleton';

/**
 * Skeleton for a table with multiple rows
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = memo(({
  rows = 5,
  columns = 5,
}) => (
  <div className="w-full">
    <div className="flex items-center gap-4 py-2 px-4 border-b border-airq-dark/20 bg-airq-dark/5">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width="15%" height="0.875rem" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} columns={columns} />
    ))}
  </div>
));

TableSkeleton.displayName = 'TableSkeleton';

/**
 * Skeleton for metrics card
 */
export const MetricsCardSkeleton: React.FC = memo(() => (
  <div className="h-full w-full p-2">
    <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center justify-center p-2 rounded bg-airq-dark/5">
          <Skeleton variant="text" width="60%" height="0.625rem" className="mb-1" />
          <Skeleton variant="text" width="80%" height="1.5rem" />
        </div>
      ))}
    </div>
  </div>
));

MetricsCardSkeleton.displayName = 'MetricsCardSkeleton';

export default Skeleton;
