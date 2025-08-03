import { gql } from '@apollo/client';
import { ERROR_LOG_FRAGMENT } from './fragments';

// Get all error logs query
export const GET_ERROR_LOGS = gql`
  query GetErrorLogs {
    errorLogs {
      ...ErrorLogInfo
    }
  }
  ${ERROR_LOG_FRAGMENT}
`;