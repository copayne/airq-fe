import { gql } from '@apollo/client';
import { SENSOR_READING_COMPLETE_FRAGMENT } from './fragments';

// Optimized filtered sensor readings query using fragments
export const GET_FILTERED_SENSOR_READINGS = gql`
  query GetFilteredSensorReadings($input: SensorDataFilterInput!) {
    filteredSensorReadings(filters: $input) {
      ...SensorReadingComplete
    }
  }
  ${SENSOR_READING_COMPLETE_FRAGMENT}
`;

// Get recent sensor readings (limited to 1000)
export const GET_SENSOR_READINGS = gql`
  query GetSensorReadings {
    sensorReadings {
      ...SensorReadingComplete
    }
  }
  ${SENSOR_READING_COMPLETE_FRAGMENT}
`;