import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { env } from '~/env.js';

// Authentication link to add Bearer token to requests
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...(headers as Record<string, string>),
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Error handling link with authentication error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error('GraphQL error:', {
        message,
        locations: locations ? JSON.stringify(locations) : undefined,
        path: path ? JSON.stringify(path) : undefined
      });

      // Handle authentication errors
      if (message === 'Authentication required' || 
          message.includes('Insufficient permissions') ||
          extensions?.code === 'UNAUTHENTICATED') {
        // Clear authentication data on auth errors
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          // Redirect to login page if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?message=session_expired';
          }
        }
      }
    });
  }

  if (networkError) {
    console.error('Network error:', networkError.message);
    
    // Handle specific network errors
    if (networkError.message.includes('Failed to fetch')) {
      console.error('Server appears to be unreachable');
    }

    // Handle 401 Unauthorized responses
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?message=session_expired';
        }
      }
    }
  }
});

// Simple retry logic using Apollo's built-in capabilities
// We'll handle retries at the query level instead of link level

// HTTP link with timeout and credentials
const httpLink = new HttpLink({
  uri: env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  credentials: 'include',
  fetchOptions: {
    timeout: 10000, // 10 second timeout to prevent hanging
  },
});

// Enhanced cache configuration with type policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        sensors: {
          merge: false, // Replace instead of merge to prevent stale data
        },
        sensorReadings: {
          merge: false, // Replace instead of merge to prevent stale data
        },
        filteredSensorReadings: {
          merge: false, // Replace instead of merge for fresh results
          keyArgs: ["filters"], // Cache different filter combinations separately
        },
        me: {
          merge: false, // Replace user data on login/logout
        },
      },
    },
    SensorObject: {
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
    SensorReadingObject: {
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
    LocationObject: {
      keyFields: ["id"],
    },
    UserObject: {
      keyFields: ["id"],
    },
    CO2ReadingObject: {
      keyFields: ["id"],
    },
    TemperatureReadingObject: {
      keyFields: ["id"],
    },
    HumidityReadingObject: {
      keyFields: ["id"],
    },
    ErrorLogObject: {
      keyFields: ["id"],
    },
    SensorLocationObject: {
      keyFields: ["id"],
    },
  },
});

// Combine links: auth -> error handling -> http
const link = from([
  authLink,
  errorLink,
  httpLink,
]);

const client = new ApolloClient({
  link,
  cache,
  resolvers: {},
  typeDefs: `
    type SensorReadingObject {
      id: ID!
      sensorId: Int!
      readingTime: String!
      sensor: SensorObject
      location: LocationObject
      co2Reading: CO2ReadingObject
      temperatureReading: TemperatureReadingObject
      humidityReading: HumidityReadingObject
      isSuccess: Boolean
      errorLogs: [ErrorLogObject]
    }

    type SensorObject {
      id: ID!
      name: String!
      model: String!
      installationDate: String!
      isActive: Boolean
      readings: [SensorReadingObject]
      sensorLocations: [SensorLocationObject]
      currentLocation: LocationObject
      lastReading: SensorReadingObject
    }

    type LocationObject {
      id: ID!
      name: String!
      description: String
      sensorLocations: [SensorLocationObject]
      readings: [SensorReadingObject]
      currentSensors: [SensorObject]
    }

    type CO2ReadingObject {
      id: ID!
      readingId: Int!
      co2Ppm: Float!
      sensorReading: SensorReadingObject
    }

    type TemperatureReadingObject {
      id: ID!
      readingId: Int!
      temperatureCelsius: Float!
      sensorReading: SensorReadingObject
    }

    type HumidityReadingObject {
      id: ID!
      readingId: Int!
      humidityPercentage: Float!
      sensorReading: SensorReadingObject
    }

    type ErrorLogObject {
      id: ID!
      readingId: Int!
      errorType: String!
      errorMessage: String!
      createdAt: String!
      sensorReading: SensorReadingObject
    }

    type SensorLocationObject {
      id: ID!
      sensorId: Int!
      locationId: Int!
      startTime: String!
      endTime: String
      isCurrent: Boolean!
      sensor: SensorObject
      location: LocationObject
    }

    type UserObject {
      id: ID!
      username: String!
      email: String!
      firstName: String
      lastName: String
      fullName: String
      role: String!
      isActive: Boolean!
      emailVerified: Boolean!
      createdAt: String!
      updatedAt: String!
      lastLogin: String
    }

    type AuthPayload {
      user: UserObject
      token: String
      success: Boolean!
      message: String!
    }

    type Query {
      sensors: [SensorObject]
      locations: [LocationObject]
      sensorLocations: [SensorLocationObject]
      sensorReadings: [SensorReadingObject]
      humidityReadings: [HumidityReadingObject]
      temperatureReadings: [TemperatureReadingObject]
      co2Readings: [CO2ReadingObject]
      errorLogs: [ErrorLogObject]
      filteredSensorReadings(filters: SensorDataFilterInput!): [SensorReadingObject]
      me: UserObject
      users: [UserObject]
      sensor(id: ID!): SensorObject
      location(id: ID!): LocationObject
      user(id: ID!): UserObject
    }

    type Mutation {
      createSensorReading(input: CreateSensorReadingInput!): CreateSensorReadingPayload!
      loginUser(input: LoginInput!): AuthPayload!
      registerUser(input: RegisterInput!): AuthPayload!
      verifyEmail(input: EmailVerificationInput!): VerifyEmail!
      requestPasswordReset(input: PasswordResetRequestInput!): RequestPasswordReset!
      resetPassword(input: PasswordResetInput!): ResetPassword!
      logoutUser(input: LogoutInput!): LogoutUser!
    }

    input LoginInput {
      username_or_email: String!
      password: String!
    }

    input RegisterInput {
      username: String!
      email: String!
      password: String!
      first_name: String
      last_name: String
    }

    input EmailVerificationInput {
      token: String!
    }

    input PasswordResetRequestInput {
      email: String!
    }

    input PasswordResetInput {
      token: String!
      newPassword: String!
    }

    input LogoutInput {
      token: String!
    }

    input CreateSensorReadingInput {
      sensorId: Int!
      humidityPercentage: Float
      temperatureCelsius: Float
      co2Ppm: Int
    }

    type CreateSensorReadingPayload {
      sensorReading: SensorReadingObject
      success: Boolean!
      message: String!
      errors: [String!]
    }

    input SensorDataFilterInput {
      startDate: String
      endDate: String
      minCo2Ppm: Float
      maxCo2Ppm: Float
      minTemperatureCelsius: Float
      maxTemperatureCelsius: Float
      minHumidityPercentage: Float
      maxHumidityPercentage: Float
      sensorIds: [ID]
      locationIds: [ID]
      limit: Int
      offset: Int
      orderBy: String
      orderDirection: String
    }

    type VerifyEmail {
      success: Boolean!
      message: String!
    }

    type RequestPasswordReset {
      success: Boolean!
      message: String!
    }

    type ResetPassword {
      success: Boolean!
      message: String!
    }

    type LogoutUser {
      success: Boolean!
      message: String!
    }
  `,
});

export default client;