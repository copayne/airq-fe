import { gql } from '@apollo/client';

export const GET_FILTERED_SENSOR_READINGS = gql`
  query GetFilteredSensorReadings($input: SensorDataFilterInput!) {
    filteredSensorReadings(filters: $input) {
      id
      readingTime
      sensor {
        id
        name
        model
      }
      location {
        id
        name
        description
      }
      co2Reading {
        co2Ppm
      }
      temperatureReading {
        temperatureCelsius
      }
      humidityReading {
        humidityPercentage
      }
      isSuccess
    }
  }
`;

export const CREATE_SENSOR_READING = gql`
  mutation CreateSensorReading($input: CreateSensorReadingInput!) {
    createSensorReading(input: $input) {
      sensorReading {
        id
        sensor {
          id
        }
        location {
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