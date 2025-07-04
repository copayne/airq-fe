import { gql } from '@apollo/client';
import { SENSOR_READING_COMPLETE_FRAGMENT, READING_MEASUREMENTS_FRAGMENT } from './fragments';

// Optimized filtered sensor readings query using fragments
export const GET_FILTERED_SENSOR_READINGS = gql`
  query GetFilteredSensorReadings($input: SensorDataFilterInput!) {
    filteredSensorReadings(filters: $input) {
      ...SensorReadingComplete
    }
  }
  ${SENSOR_READING_COMPLETE_FRAGMENT}
`;

// Lightweight version for basic data only
export const GET_FILTERED_SENSOR_READINGS_BASIC = gql`
  query GetFilteredSensorReadingsBasic($input: SensorDataFilterInput!) {
    filteredSensorReadings(filters: $input) {
      id
      readingTime
      isSuccess
      ...ReadingMeasurements
    }
  }
  ${READING_MEASUREMENTS_FRAGMENT}
`;

export const CREATE_SENSOR_READING = gql`
  mutation CreateSensorReading($input: CreateSensorReadingInput!) {
    createSensorReading(input: $input) {
      sensorReading {
        id
        sensor {
          id
        }
        humidityReading {
          humidityPercentage
        }
        temperatureReading {
          temperatureCelsius
        }
        co2Reading {
          co2Ppm
        }
      }
    }
  }
`;