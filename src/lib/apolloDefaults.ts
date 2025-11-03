// Shared Apollo Client query options
// This file provides common configuration for Apollo queries across the application

export const DEFAULT_QUERY_OPTIONS = {
  errorPolicy: 'all' as const, // Return partial data with errors
  notifyOnNetworkStatusChange: true, // Trigger loading state changes
};

export const CACHE_AND_NETWORK_OPTIONS = {
  ...DEFAULT_QUERY_OPTIONS,
  fetchPolicy: 'cache-and-network' as const, // Show cached data immediately, fetch fresh data in background
};

export const CACHE_FIRST_OPTIONS = {
  ...DEFAULT_QUERY_OPTIONS,
  fetchPolicy: 'cache-first' as const, // Use cache if available
};

export const NETWORK_ONLY_OPTIONS = {
  ...DEFAULT_QUERY_OPTIONS,
  fetchPolicy: 'network-only' as const, // Always fetch from network
};
