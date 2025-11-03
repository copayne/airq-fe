import { useQuery } from '@apollo/client';
import { GET_ERROR_LOGS } from '~/graphql/ErrorLog';
import { DEFAULT_QUERY_OPTIONS } from '~/lib/apolloDefaults';

interface ErrorLog {
  id: string;
  readingId: number;
  errorType: string;
  errorMessage: string;
  createdAt: string;
}

interface ErrorLogsData {
  errorLogs: ErrorLog[];
}

export function useErrorLogs() {
  const { data, loading, error, refetch } = useQuery<ErrorLogsData>(GET_ERROR_LOGS, {
    ...DEFAULT_QUERY_OPTIONS,
  });

  return {
    errorLogs: data?.errorLogs ?? [],
    loading,
    error,
    refetch,
  };
}