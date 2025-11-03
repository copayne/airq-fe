import { useQuery, type DocumentNode, type QueryHookOptions } from '@apollo/client';
import { useMemo } from 'react';
import { DEFAULT_QUERY_OPTIONS } from '~/lib/apolloDefaults';

/**
 * Generic hook for fetching list data from GraphQL queries.
 * Consolidates the common pattern of querying for a list of items.
 *
 * @template T The type of items in the list
 * @param query The GraphQL query document
 * @param dataKey The key in the query response that contains the list data
 * @param options Optional Apollo query options to override defaults
 * @returns Object containing the list data, loading state, error, and refetch function
 *
 * @example
 * ```typescript
 * const { data: users, loading, error } = useQueryList<User>(
 *   GET_USERS,
 *   'users'
 * );
 * ```
 */
export function useQueryList<T>(
  query: DocumentNode,
  dataKey: string,
  options?: QueryHookOptions
) {
  const { data, loading, error, refetch } = useQuery<Record<string, T[]>>(
    query,
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    }
  );

  return useMemo(() => ({
    data: data?.[dataKey] ?? [],
    loading,
    error,
    refetch,
  }), [data, dataKey, loading, error, refetch]);
}
