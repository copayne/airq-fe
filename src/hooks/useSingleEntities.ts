import { useQuery } from '@apollo/client';
import { GET_USER } from '~/graphql/auth';

// Sensor and Location single entity queries are already handled in existing hooks
// This hook adds the missing user by ID query

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

interface UserData {
  user: User;
}

export function useUserById(id: number) {
  const { data, loading, error, refetch } = useQuery<UserData>(GET_USER, {
    variables: { id },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    skip: !id, // Skip query if no ID provided
  });

  return {
    user: data?.user,
    loading,
    error,
    refetch,
  };
}