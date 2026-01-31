import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_LOCATIONS } from '~/graphql/Location';
import { CACHE_FIRST_OPTIONS } from '~/lib/apolloDefaults';

interface Location {
  id: string;
  name: string;
  description?: string;
  currentSensors?: {
    id: string;
    name: string;
    isActive: boolean;
  }[];
}

interface GetLocationsData {
  locations: Location[];
}

/**
 * Hook for fetching all locations
 */
export function useLocations() {
  const { data, loading, error, refetch } = useQuery<GetLocationsData>(
    GET_LOCATIONS,
    {
      ...CACHE_FIRST_OPTIONS,
    }
  );

  return useMemo(() => ({
    locations: data?.locations ?? [],
    loading,
    error,
    refetch,
  }), [data?.locations, loading, error, refetch]);
}
