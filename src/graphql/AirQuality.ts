// GraphQL queries for air quality distribution data

import { gql } from '@apollo/client';

/**
 * Query to get air quality condition distribution
 *
 * Returns aggregated counts of sensor readings categorized by air quality condition
 * (good, moderate, poor). All business logic and calculations are performed on the
 * backend - frontend only renders the data.
 */
export const GET_AIR_QUALITY_DISTRIBUTION = gql`
  query GetAirQualityDistribution {
    airQualityDistribution {
      good
      moderate
      poor
      total
    }
  }
`;

/**
 * Query to get air quality distributions across multiple time periods
 *
 * Returns distributions for:
 * - Last 24 hours (1 day)
 * - Last 30 days
 * - All time (all historical data)
 *
 * All business logic and calculations are performed on the backend.
 */
export const GET_AIR_QUALITY_DISTRIBUTIONS_BY_PERIOD = gql`
  query GetAirQualityDistributionsByPeriod {
    airQualityDistributionsByPeriod {
      oneDay {
        good
        moderate
        poor
        total
      }
      thirtyDays {
        good
        moderate
        poor
        total
      }
      allTime {
        good
        moderate
        poor
        total
      }
    }
  }
`;

/**
 * Query to get daily air quality scores for heatmap visualization
 *
 * Returns an array of daily scores for the specified number of days.
 * Each score represents the average air quality for that day (0-100, 100 = best).
 */
export const GET_DAILY_AIR_QUALITY_SCORES = gql`
  query GetDailyAirQualityScores($days: Int) {
    dailyAirQualityScores(days: $days) {
      date
      score
      readingCount
    }
  }
`;
