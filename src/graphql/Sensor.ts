import { gql } from '@apollo/client';

// export const GET_SENSORS = gql`
//   query GetSensors {
//     sensors {
//       id
//       name
//       model
//     }
//   }
// `;

export const GET_SENSORS = gql`
  query GetSensors {
    sensors {
      id
      name
      model
      installationDate
      isActive
      currentLocation {
        id
        name
      }
      lastReading {
        id
        readingTime
        isSuccess
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
    }
  }
`;
