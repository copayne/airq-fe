import { gql } from '@apollo/client';

export const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
      description
      currentSensors {
        id
        name
        isActive
      }
    }
  }
`;

export const GET_LOCATION = gql`
  query GetLocation($id: Int!) {
    location(id: $id) {
      id
      name
      description
      currentSensors {
        id
        name
        model
        isActive
      }
    }
  }
`;

export const CREATE_LOCATION = gql`
  mutation CreateLocation($input: CreateLocationInput!) {
    createLocation(input: $input) {
      location {
        id
        name
        description
      }
      success
      message
      errors
    }
  }
`;

export const UPDATE_LOCATION = gql`
  mutation UpdateLocation($input: UpdateLocationInput!) {
    updateLocation(input: $input) {
      location {
        id
        name
        description
      }
      success
      message
      errors
    }
  }
`;

export const DELETE_LOCATION = gql`
  mutation DeleteLocation($id: Int!) {
    deleteLocation(id: $id) {
      success
      message
      errors
    }
  }
`;
