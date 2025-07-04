import {
  ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const IP_ADDRESS = 'http://10.201.1.115';
const PORT = '5000';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error('GraphQL error:', {
        message,
        locations: locations ? JSON.stringify(locations) : undefined,
        path: path ? JSON.stringify(path) : undefined
      });
    });
  }

  if (networkError) {
    console.error('Network error:', networkError.message);
    
    // Handle specific network errors
    if (networkError.message.includes('Failed to fetch')) {
      console.error('Server appears to be unreachable');
    }
  }
});

// Simple retry logic using Apollo's built-in capabilities
// We'll handle retries at the query level instead of link level

// HTTP link
const httpLink = new HttpLink({
  uri: `${IP_ADDRESS}:${PORT}/graphql`,
});

// Enhanced cache configuration with type policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        sensors: {
          merge: false, // Replace instead of merge to prevent stale data
        },
        filteredSensorReadings: {
          merge: false, // Replace instead of merge for fresh results
          keyArgs: ["filters"], // Cache different filter combinations separately
        },
      },
    },
    Sensor: {
      keyFields: ["id"],
      fields: {
        lastReading: {
          merge: true, // Merge nested reading data for updates
        },
        currentLocation: {
          merge: true, // Merge location updates
        },
      },
    },
    SensorReading: {
      keyFields: ["id"],
      fields: {
        sensor: {
          merge: true, // Merge sensor data updates
        },
        location: {
          merge: true, // Merge location data updates
        },
      },
    },
    Location: {
      keyFields: ["id"],
    },
    CO2Reading: {
      merge: true, // Always merge measurement updates
    },
    TemperatureReading: {
      merge: true, // Always merge measurement updates
    },
    HumidityReading: {
      merge: true, // Always merge measurement updates
    },
  },
});

// Combine links: error handling -> http
const link = from([
  errorLink,
  httpLink,
]);

const client = new ApolloClient({
  link,
  cache,
  resolvers: {},
  typeDefs: `
    type SensorReading {
      id: ID!
      readingTime: String!
      sensor: Sensor!
      location: Location!
      co2Reading: CO2Reading!
      temperatureReading: TemperatureReading!
      humidityReading: HumidityReading!
      isSuccess: Boolean!
    }

    type Sensor {
      id: ID!
      name: String!
      model: String!
    }

    type Location {
      id: ID!
      name: String!
      description: String!
    }

    type CO2Reading {
      co2Ppm: Float!
    }

    type TemperatureReading {
      temperatureCelsius: Float!
    }

    type HumidityReading {
      humidityPercentage: Float!
    }

    type Query {
      sensorReadings: [SensorReading!]!
    }
  `,
});

export default client;