// Consolidated sensor-related type definitions
// This file serves as the single source of truth for all sensor types across the application

// Individual measurement reading types
export interface CO2Reading {
  id: string;
  readingId: number;
  co2Ppm: number;
}

export interface TemperatureReading {
  id: string;
  readingId: number;
  temperatureCelsius: number;
}

export interface HumidityReading {
  id: string;
  readingId: number;
  humidityPercentage: number;
}

// Location type
export interface Location {
  id: string;
  name: string;
  description?: string;
}

// Sensor type with basic sensor information
export interface SensorInfo {
  id: string;
  name: string;
  model: string;
  isActive: boolean;
  installationDate: string;
}

// Complete sensor reading with all related data
export interface SensorReading {
  id: string;
  readingTime: string;
  isSuccess?: boolean;
  sensor: {
    id: string;
    name: string;
    model?: string;
    isActive?: boolean;
    installationDate?: string;
  };
  location?: {
    id: string;
    name: string;
    description?: string;
  };
  co2Reading?: {
    co2Ppm: number;
  } | null;
  temperatureReading?: {
    temperatureCelsius: number;
  } | null;
  humidityReading?: {
    humidityPercentage: number;
  } | null;
}

// Sensor type with current location and optional last reading
export interface Sensor {
  id: string;
  model: string;
  name: string;
  installationDate: Date;
  isActive: boolean;
  currentLocation: {
    id: string;
    name: string;
  };
  lastReading?: {
    id: string;
    readingTime: string;
    sensor: {
      id: string;
      name: string;
    };
    location: {
      id: string;
      name: string;
    };
    co2Reading: {
      co2Ppm: number;
    };
    temperatureReading: {
      temperatureCelsius: number;
    };
    humidityReading: {
      humidityPercentage: number;
    };
    isSuccess: boolean;
  };
}

// Input types for mutations
export interface CreateSensorReadingInput {
  sensorId: number;
  humidityPercentage?: number;
  temperatureCelsius?: number;
  co2Ppm?: number;
}

// GraphQL response types
export interface GetFilteredSensorReadingsData {
  filteredSensorReadings: SensorReading[];
}

export interface RecentSensorReadingsData {
  sensorReadings: SensorReading[];
}

export interface GetSensorsData {
  sensors: Sensor[];
}

export interface CO2ReadingsData {
  co2Readings: CO2Reading[];
}

export interface TemperatureReadingsData {
  temperatureReadings: TemperatureReading[];
}

export interface HumidityReadingsData {
  humidityReadings: HumidityReading[];
}

export interface CreateSensorReadingPayload {
  success: boolean;
  message: string;
  errors: string[];
  sensorReading?: SensorReading;
}

export interface CreateSensorReadingData {
  createSensorReading: CreateSensorReadingPayload;
}

// Air quality distribution data
export interface AirQualityDistribution {
  good: number;
  moderate: number;
  poor: number;
  total: number;
}

export interface GetAirQualityDistributionData {
  airQualityDistribution: AirQualityDistribution;
}

export interface AirQualityDistributionsByPeriod {
  oneDay: AirQualityDistribution;
  thirtyDays: AirQualityDistribution;
  allTime: AirQualityDistribution;
}

export interface GetAirQualityDistributionsByPeriodData {
  airQualityDistributionsByPeriod: AirQualityDistributionsByPeriod;
}

// Daily air quality score for heatmap
export interface DailyAirQualityScore {
  date: string;
  score: number | null;
  readingCount: number;
}

export interface GetDailyAirQualityScoresData {
  dailyAirQualityScores: DailyAirQualityScore[];
}

// Ring Device types
export interface RingDevice {
  id: string;
  deviceId: string;
  deviceType: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RingDeviceInput {
  deviceId: string;
  deviceType: string;
  name: string;
  location?: string;
}

export interface GetRingDevicesData {
  ringDevices: RingDevice[];
}

export interface BatchUpdateRingDevicesData {
  batchUpdateRingDevices: {
    success: boolean;
    message: string;
    devicesUpdated: number;
    devicesCreated: number;
  };
}
