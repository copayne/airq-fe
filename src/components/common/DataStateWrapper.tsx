import React, { type ReactNode } from 'react';
import type { ApolloError } from '@apollo/client';

interface DataStateWrapperProps {
  loading: boolean;
  error?: ApolloError;
  data: unknown;
  children: ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
  emptyClassName?: string;
  showSpinner?: boolean;
}

/**
 * Reusable wrapper component for handling loading, error, and empty data states.
 * Consolidates the common pattern of checking loading/error/empty states before rendering content.
 *
 * @param loading - Loading state from Apollo query
 * @param error - Error object from Apollo query
 * @param data - Data from Apollo query (checked for truthiness)
 * @param children - Content to render when data is available
 * @param loadingMessage - Custom loading message (default: "Loading...")
 * @param errorMessage - Custom error message (default: "Error loading data")
 * @param emptyMessage - Custom empty state message (default: "No data available")
 * @param className - Base className for all state containers (default: "h-full w-full flex items-center justify-center bg-airq-light")
 * @param loadingClassName - Additional className for loading state
 * @param errorClassName - Additional className for error state
 * @param emptyClassName - Additional className for empty state
 * @param showSpinner - Show spinner animation instead of text for loading (default: false)
 *
 * @example
 * ```tsx
 * <DataStateWrapper loading={loading} error={error} data={metrics}>
 *   <MetricsDisplay metrics={metrics} />
 * </DataStateWrapper>
 * ```
 */
export const DataStateWrapper: React.FC<DataStateWrapperProps> = ({
  loading,
  error,
  data,
  children,
  loadingMessage = 'Loading...',
  errorMessage = 'Error loading data',
  emptyMessage = 'No data available',
  className = 'h-full w-full flex items-center justify-center bg-airq-light',
  loadingClassName = '',
  errorClassName = '',
  emptyClassName = '',
  showSpinner = false,
}) => {
  // Only show loading if we don't have any data yet
  // This prevents flickering during re-renders or background refetches
  if (loading && !data) {
    return (
      <div className={`${className} ${loadingClassName}`}>
        {showSpinner ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-airq-contrast"></div>
        ) : (
          <p className="text-airq-dark">{loadingMessage}</p>
        )}
      </div>
    );
  }

  // Only show error if we don't have any cached data
  if (error && !data) {
    return (
      <div className={`${className} ${errorClassName}`}>
        <p className="text-airq-tertiary">{errorMessage}</p>
      </div>
    );
  }

  // If we still don't have data, show empty state
  if (!data) {
    return (
      <div className={`${className} ${emptyClassName}`}>
        <p className="text-airq-dark">{emptyMessage}</p>
      </div>
    );
  }

  // Data is available, render children
  return <>{children}</>;
};
