import { gql } from '@apollo/client';
import { SENSOR_WITH_LAST_READING_FRAGMENT } from './fragments';

// Basic sensors query without last reading data
export const GET_SENSORS_BASIC = gql`
  query GetSensorsBasic {
    sensors {
      id
      name
      model
      isActive
      installationDate
      currentLocation {
        id
        name
      }
    }
  }
`;

// Optimized sensors query with fragments and conditional field fetching
export const GET_SENSORS = gql`
  query GetSensors($includeLastReading: Boolean = true) {
    sensors {
      ...SensorWithLastReading @include(if: $includeLastReading)
      id @skip(if: $includeLastReading)
      name @skip(if: $includeLastReading)
      model @skip(if: $includeLastReading)
      isActive @skip(if: $includeLastReading)
      installationDate @skip(if: $includeLastReading)
      currentLocation @skip(if: $includeLastReading) {
        id
        name
      }
    }
  }
  ${SENSOR_WITH_LAST_READING_FRAGMENT}
`;
