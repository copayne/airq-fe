import {
  ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const IP_ADDRESS = 'http://10.201.1.115';
const PORT = '5000';

const httpLink = new HttpLink({
  uri: `${IP_ADDRESS}:${PORT}/graphql`,
});

const cache = new InMemoryCache();

const client = new ApolloClient({
  link: httpLink,
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