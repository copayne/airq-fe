import { gql } from '@apollo/client';

export const GET_SENSORS = gql`
  query GetSensors {
    sensors {
      id
      name
      model
    }
  }
`;
