// Authentication hooks
export { useLogin, useRegister, useVerifyEmail, useRequestPasswordReset, useResetPassword, useLogout } from './useAuthMutations';
export { useCurrentUser } from './useCurrentUser';
export { useUsers } from './useUsers';
export { useUserById } from './useSingleEntities';

// Sensor data hooks
export { useSensors, type UseSensorsOptions } from './useSensors';
export { useSensorReadingData } from './useSensorReadingData';
export { useRecentSensorReadings } from './useRecentSensorReadings';
export { useCreateSensorReading } from './useCreateSensorReading';

// Location and sensor management hooks
export { useSensorLocations } from './useSensorLocations';

// Measurement data hooks
export {
  useCO2Measurements,
  useTemperatureMeasurements,
  useHumidityMeasurements,
} from './useMeasurements';

// Backward compatibility aliases
export { useCO2Measurements as useCO2Readings } from './useMeasurements';
export { useTemperatureMeasurements as useTemperatureReadings } from './useMeasurements';
export { useHumidityMeasurements as useHumidityReadings } from './useMeasurements';

// Error monitoring hooks
export { useErrorLogs } from './useErrorLogs';

// Utility hooks
export { useDebouncedRefetch } from './useDebouncedRefetch';

// Air quality hooks
export { useAirQualityDistribution } from './useAirQualityDistribution';