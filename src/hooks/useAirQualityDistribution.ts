/**
 * Hook for fetching air quality distribution data from the API
 *
 * This hook simply fetches pre-calculated distribution data from the backend.
 * All business logic (threshold calculations, condition assessments) happens
 * server-side.
 */

import { useQuery, type QueryResult } from '@apollo/client';
import { useMemo, useRef, useEffect } from 'react';
import { GET_AIR_QUALITY_DISTRIBUTION } from '~/graphql/AirQuality';
import type { GetAirQualityDistributionData, AirQualityDistribution } from '~/types/sensors';
import { CACHE_FIRST_OPTIONS } from '~/lib/apolloDefaults';
import { env } from '~/env.js';

// Global cache to track initial fetch across component unmounts/remounts
const distributionFetchCache = new Map<string, boolean>();

export interface UseAirQualityDistributionResult {
  distribution: AirQualityDistribution | null;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
}

/**
 * Fetch air quality condition distribution from the API
 *
 * @returns Object containing distribution data, loading state, error, and refetch function
 *
 * @example
 * const { distribution, loading, error } = useAirQualityDistribution();
 *
 * if (distribution) {
 *   console.log(`Good: ${distribution.good}, Moderate: ${distribution.moderate}, Poor: ${distribution.poor}`);
 * }
 */
export function useAirQualityDistribution(): UseAirQualityDistributionResult {
  // Track if we've already fetched on mount to prevent re-fetch on re-render
  const hasFetchedOnMount = useRef(false);

  const { data, loading, error, refetch }: QueryResult<GetAirQualityDistributionData> = useQuery(
    GET_AIR_QUALITY_DISTRIBUTION,
    {
      ...CACHE_FIRST_OPTIONS,
      pollInterval: env.NEXT_PUBLIC_POLL_INTERVAL_MS, // Poll at configured interval (10 minutes)
      skip: !hasFetchedOnMount.current && distributionFetchCache.get('initial-fetch') === true, // Skip if already fetched globally
    }
  );

  // Mark as fetched on first successful data load
  useEffect(() => {
    if (data && !hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true;
      distributionFetchCache.set('initial-fetch', true);
    }
  }, [data]);

  return useMemo(() => ({
    distribution: data?.airQualityDistribution ?? null,
    loading,
    error,
    refetch: () => void refetch(),
  }), [data, loading, error, refetch]);
}
