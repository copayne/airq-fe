import { gql } from '@apollo/client';

// Core sensor information fragment
export const SENSOR_CORE_FRAGMENT = gql`
  fragment SensorCore on SensorObject {
    id
    name
    model
    isActive
    installationDate
  }
`;

// Location information fragment
export const LOCATION_FRAGMENT = gql`
  fragment LocationInfo on LocationObject {
    id
    name
    description
  }
`;

// Measurement readings fragment
export const READING_MEASUREMENTS_FRAGMENT = gql`
  fragment ReadingMeasurements on SensorReadingObject {
    co2Reading {
      id
      co2Ppm
    }
    temperatureReading {
      id
      temperatureCelsius
    }
    humidityReading {
      id
      humidityPercentage
    }
  }
`;

// Basic sensor reading fragment
export const SENSOR_READING_BASIC_FRAGMENT = gql`
  fragment SensorReadingBasic on SensorReadingObject {
    id
    readingTime
    isSuccess
  }
`;

// Complete sensor reading fragment
export const SENSOR_READING_COMPLETE_FRAGMENT = gql`
  fragment SensorReadingComplete on SensorReadingObject {
    ...SensorReadingBasic
    ...ReadingMeasurements
    sensor {
      ...SensorCore
    }
    location {
      ...LocationInfo
    }
  }
  ${SENSOR_READING_BASIC_FRAGMENT}
  ${READING_MEASUREMENTS_FRAGMENT}
  ${SENSOR_CORE_FRAGMENT}
  ${LOCATION_FRAGMENT}
`;

// Sensor with last reading fragment
export const SENSOR_WITH_LAST_READING_FRAGMENT = gql`
  fragment SensorWithLastReading on SensorObject {
    ...SensorCore
    currentLocation {
      id
      name
    }
    lastReading {
      ...SensorReadingBasic
      ...ReadingMeasurements
    }
  }
  ${SENSOR_CORE_FRAGMENT}
  ${SENSOR_READING_BASIC_FRAGMENT}
  ${READING_MEASUREMENTS_FRAGMENT}
`;

// Error log fragment
export const ERROR_LOG_FRAGMENT = gql`
  fragment ErrorLogInfo on ErrorLogObject {
    id
    readingId
    errorType
    errorMessage
    createdAt
  }
`;

// Sensor location fragment
export const SENSOR_LOCATION_FRAGMENT = gql`
  fragment SensorLocationInfo on SensorLocationObject {
    id
    sensorId
    locationId
    startTime
    endTime
    isCurrent
    sensor {
      ...SensorCore
    }
    location {
      ...LocationInfo
    }
  }
  ${SENSOR_CORE_FRAGMENT}
  ${LOCATION_FRAGMENT}
`;

// Individual measurement fragments
export const CO2_READING_FRAGMENT = gql`
  fragment CO2ReadingInfo on CO2ReadingObject {
    id
    readingId
    co2Ppm
  }
`;

export const TEMPERATURE_READING_FRAGMENT = gql`
  fragment TemperatureReadingInfo on TemperatureReadingObject {
    id
    readingId
    temperatureCelsius
  }
`;

export const HUMIDITY_READING_FRAGMENT = gql`
  fragment HumidityReadingInfo on HumidityReadingObject {
    id
    readingId
    humidityPercentage
  }
`;