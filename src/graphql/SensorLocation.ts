import { gql } from '@apollo/client';
import { SENSOR_LOCATION_FRAGMENT } from './fragments';

// Get all sensor locations query
export const GET_SENSOR_LOCATIONS = gql`
  query GetSensorLocations {
    sensorLocations {
      ...SensorLocationInfo
    }
  }
  ${SENSOR_LOCATION_FRAGMENT}
`;