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

export const ASSIGN_SENSOR_TO_LOCATION = gql`
  mutation AssignSensorToLocation($input: AssignSensorLocationInput!) {
    assignSensorToLocation(input: $input) {
      sensorLocation {
        id
        startTime
        isCurrent
        sensor {
          id
          name
        }
        location {
          id
          name
        }
      }
      success
      message
      errors
    }
  }
`;

export const MOVE_SENSOR_TO_LOCATION = gql`
  mutation MoveSensorToLocation($input: MoveSensorInput!) {
    moveSensorToLocation(input: $input) {
      sensorLocation {
        id
        startTime
        isCurrent
        sensor {
          id
          name
        }
        location {
          id
          name
        }
      }
      success
      message
      errors
    }
  }
`;

export const REMOVE_SENSOR_FROM_LOCATION = gql`
  mutation RemoveSensorFromLocation($sensorId: Int!) {
    removeSensorFromLocation(sensorId: $sensorId) {
      sensorLocation {
        id
        endTime
        isCurrent
      }
      success
      message
      errors
    }
  }
`;