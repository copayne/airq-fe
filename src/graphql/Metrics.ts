import { gql } from '@apollo/client';

export const GET_METRICS = gql`
  query GetMetrics {
    metrics {
      co21dayAvg
      co230dayAvg
      temp1dayAvg
      temp30dayAvg
      tempHighestAllTime
      tempLowestAllTime
      co2HighestAllTime
      co2LowestAllTime
    }
  }
`;
