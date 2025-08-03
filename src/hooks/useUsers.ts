import { useQuery } from '@apollo/client';
import { GET_USERS } from '~/graphql/auth';

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
    errorPolicy: 'all', // Return partial data with errors
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network', // Always fetch fresh data but use cache first
  });

  return {
    users: data?.users ?? [],
    loading,
    error,
    refetch,
  };
}