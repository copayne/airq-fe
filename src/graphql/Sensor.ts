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

export const GET_SENSOR = gql`
  query GetSensor($id: Int!) {
    sensor(id: $id) {
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

export const CREATE_SENSOR = gql`
  mutation CreateSensor($input: CreateSensorInput!) {
    createSensor(input: $input) {
      sensor {
        id
        name
        model
        isActive
        installationDate
      }
      success
      message
      errors
    }
  }
`;

export const UPDATE_SENSOR = gql`
  mutation UpdateSensor($input: UpdateSensorInput!) {
    updateSensor(input: $input) {
      sensor {
        id
        name
        model
        isActive
      }
      success
      message
      errors
    }
  }
`;

export const DELETE_SENSOR = gql`
  mutation DeleteSensor($id: Int!) {
    deleteSensor(id: $id) {
      success
      message
      errors
    }
  }
`;

export const TOGGLE_SENSOR_ACTIVE = gql`
  mutation ToggleSensorActive($id: Int!, $isActive: Boolean!) {
    toggleSensorActive(id: $id, isActive: $isActive) {
      sensor {
        id
        name
        isActive
      }
      success
      message
      errors
    }
  }
`;
