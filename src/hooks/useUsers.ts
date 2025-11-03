import { GET_USERS } from '~/graphql/auth';
import { CACHE_FIRST_OPTIONS } from '~/lib/apolloDefaults';
import { useQueryList } from './useQueryList';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export function useUsers() {
  const { data: users, loading, error, refetch } = useQueryList<User>(
    GET_USERS,
    'users',
    CACHE_FIRST_OPTIONS
  );

  return {
    users,
    loading,
    error,
    refetch,
  };
}