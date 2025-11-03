import { useQuery } from '@apollo/client';
import { GET_USERS } from '~/graphql/auth';
import { CACHE_AND_NETWORK_OPTIONS } from '~/lib/apolloDefaults';

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

interface UsersData {
  users: User[];
}

export function useUsers() {
  const { data, loading, error, refetch } = useQuery<UsersData>(GET_USERS, {
    ...CACHE_AND_NETWORK_OPTIONS,
  });

  return {
    users: data?.users ?? [],
    loading,
    error,
    refetch,
  };
}