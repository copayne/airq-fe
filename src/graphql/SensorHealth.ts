import { gql } from '@apollo/client';

// Get health status for a single sensor
export const GET_SENSOR_HEALTH = gql`
  query GetSensorHealth($sensorId: Int!) {
    sensorHealth(sensorId: $sensorId) {
      sensorId
      sensorName
      healthStatus
      isActive
      lastReadingTime
      lastSuccessfulReadingTime
      minutesSinceLastReading
      consecutiveFailures
      totalReadings
      totalFailures
      successRate
      ipAddress
      healthCheckPort
      isReachable
      latestCo2Ppm
      latestTemperatureCelsius
      latestHumidityPercentage
      lastHealthCheck
    }
  }
`;

// Get health status for all sensors
export const GET_ALL_SENSOR_HEALTH = gql`
  query GetAllSensorHealth {
    allSensorHealth {
      sensorId
      sensorName
      healthStatus
      isActive
      lastReadingTime
      lastSuccessfulReadingTime
      minutesSinceLastReading
      consecutiveFailures
      totalReadings
      totalFailures
      successRate
      ipAddress
      healthCheckPort
      latestCo2Ppm
      latestTemperatureCelsius
      latestHumidityPercentage
      lastHealthCheck
    }
  }
`;

// Get health reports history for a sensor
export const GET_SENSOR_HEALTH_REPORTS = gql`
  query GetSensorHealthReports($sensorId: Int!, $limit: Int) {
    sensorHealthReports(sensorId: $sensorId, limit: $limit) {
      id
      reportTime
      serviceRunning
      serviceUptimeSeconds
      sensorConnected
      sensorDataReady
      sensorSerialNumber
      lastCo2Ppm
      lastTemperatureCelsius
      lastHumidityPercentage
      lastReadingTime
      systemUptimeSeconds
      diskUsagePercent
      memoryUsagePercent
      cpuTemperatureCelsius
      apiReachable
      apiResponseTimeMs
      errorMessage
      consecutiveFailures
    }
  }
`;

// Ping a sensor to check its health
export const PING_SENSOR = gql`
  mutation PingSensor($sensorId: Int!) {
    pingSensor(sensorId: $sensorId) {
      success
      message
      sensorId
      serviceRunning
      serviceUptimeSeconds
      sensorConnected
      sensorDataReady
      sensorSerialNumber
      lastCo2Ppm
      lastTemperatureCelsius
      lastHumidityPercentage
      lastReadingTime
      systemUptimeSeconds
      diskUsagePercent
      memoryUsagePercent
      cpuTemperatureCelsius
      apiReachable
      apiResponseTimeMs
      errorMessage
      consecutiveFailures
      pingResponseTimeMs
    }
  }
`;

// Update sensor network configuration
export const UPDATE_SENSOR_NETWORK = gql`
  mutation UpdateSensorNetwork($sensorId: Int!, $ipAddress: String, $healthCheckPort: Int) {
    updateSensorNetwork(sensorId: $sensorId, ipAddress: $ipAddress, healthCheckPort: $healthCheckPort) {
      success
      message
      sensor {
        id
        name
        ipAddress
        healthCheckPort
      }
    }
  }
`;
