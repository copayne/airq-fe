import { useQuery } from '@apollo/client';
import { GET_ME } from '~/graphql/auth';
import { useAuth } from '~/context/AuthContext';
import type { User } from '~/types/auth';
import { useEffect } from 'react';
import { DEFAULT_QUERY_OPTIONS } from '~/lib/apolloDefaults';

interface CurrentUserData {
  me: User | null;
}

export function useCurrentUser() {
  const { isAuthenticated, token, logout } = useAuth();

  const { data, loading, error, refetch } = useQuery<CurrentUserData>(GET_ME, {
    skip: !isAuthenticated || !token,
    ...DEFAULT_QUERY_OPTIONS,
    onError: (error) => {
      console.error('Current user query error:', error);
      
      // If we get an authentication error, logout the user
      if (error.message.includes('Authentication required') || 
          error.message.includes('Insufficient permissions')) {
        logout();
      }
    },
  });

  // Sync user data with auth context when query completes
  useEffect(() => {
    if (data?.me && isAuthenticated) {
      // The user data is already in context, but we could update it here if needed
      // For now, we just verify consistency
    }
  }, [data, isAuthenticated]);

  return {
    user: data?.me ?? null,
    loading,
    error,
    refetch,
  };
}