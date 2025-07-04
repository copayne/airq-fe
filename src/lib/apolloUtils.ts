import { type ApolloClient, type NormalizedCacheObject } from '@apollo/client';

/**
 * Utility functions for Apollo Client performance optimization
 */

/**
 * Clear all cache entries (simplified version)
 */
export const clearCache = async (client: ApolloClient<NormalizedCacheObject>) => {
  await client.cache.reset();
};

/**
 * Force garbage collection on cache
 */
export const cleanupCache = (client: ApolloClient<NormalizedCacheObject>) => {
  client.cache.gc();
};

/**
 * Force refresh all active queries
 */
export const refreshAllQueries = async (client: ApolloClient<NormalizedCacheObject>) => {
  try {
    await client.refetchQueries({
      include: 'active',
    });
  } catch (error) {
    console.warn('Query refresh failed:', error);
  }
};