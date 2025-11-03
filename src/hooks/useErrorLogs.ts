import { GET_ERROR_LOGS } from '~/graphql/ErrorLog';
import { useQueryList } from './useQueryList';

interface ErrorLog {
  id: string;
  readingId: number;
  errorType: string;
  errorMessage: string;
  createdAt: string;
}

export function useErrorLogs() {
  const { data: errorLogs, loading, error, refetch } = useQueryList<ErrorLog>(
    GET_ERROR_LOGS,
    'errorLogs'
  );

  return {
    errorLogs,
    loading,
    error,
    refetch,
  };
}