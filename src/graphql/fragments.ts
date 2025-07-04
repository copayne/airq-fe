import { gql } from '@apollo/client';

// Core sensor information fragment
export const SENSOR_CORE_FRAGMENT = gql`
  fragment SensorCore on Sensor {
    id
    name
    model
    isActive
    installationDate
  }
`;

// Location information fragment
export const LOCATION_FRAGMENT = gql`
  fragment LocationInfo on Location {
    id
    name
    description
  }
`;

// Measurement readings fragment
export const READING_MEASUREMENTS_FRAGMENT = gql`
  fragment ReadingMeasurements on SensorReading {
    co2Reading {
      co2Ppm
    }
    temperatureReading {
      temperatureCelsius
    }
    humidityReading {
      humidityPercentage
    }
  }
`;

// Basic sensor reading fragment
export const SENSOR_READING_BASIC_FRAGMENT = gql`
  fragment SensorReadingBasic on SensorReading {
    id
    readingTime
    isSuccess
  }
`;

// Complete sensor reading fragment
export const SENSOR_READING_COMPLETE_FRAGMENT = gql`
  fragment SensorReadingComplete on SensorReading {
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
  fragment SensorWithLastReading on Sensor {
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