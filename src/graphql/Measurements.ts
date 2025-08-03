import { gql } from '@apollo/client';
import { CO2_READING_FRAGMENT, TEMPERATURE_READING_FRAGMENT, HUMIDITY_READING_FRAGMENT } from './fragments';

// Get all CO2 readings query
export const GET_CO2_READINGS = gql`
  query GetCO2Readings {
    co2Readings {
      ...CO2ReadingInfo
    }
  }
  ${CO2_READING_FRAGMENT}
`;

// Get all temperature readings query
export const GET_TEMPERATURE_READINGS = gql`
  query GetTemperatureReadings {
    temperatureReadings {
      ...TemperatureReadingInfo
    }
  }
  ${TEMPERATURE_READING_FRAGMENT}
`;

// Get all humidity readings query
export const GET_HUMIDITY_READINGS = gql`
  query GetHumidityReadings {
    humidityReadings {
      ...HumidityReadingInfo
    }
  }
  ${HUMIDITY_READING_FRAGMENT}
`;