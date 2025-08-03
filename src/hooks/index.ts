// Authentication hooks
export { useLogin, useRegister, useVerifyEmail, useRequestPasswordReset, useResetPassword, useLogout } from './useAuthMutations';
export { useCurrentUser } from './useCurrentUser';
export { useUsers } from './useUsers';
export { useUserById } from './useSingleEntities';

// Sensor data hooks
export { useSensorData } from './useSensorData';
export { useSensorDataOptimized } from './useSensorDataOptimized';
export { useSensorReadingData } from './useSensorReadingData';
export { useRecentSensorReadings } from './useRecentSensorReadings';
export { useCreateSensorReading } from './useCreateSensorReading';

// Location and sensor management hooks
export { useSensorLocations } from './useSensorLocations';

// Measurement data hooks
export { useCO2Readings, useTemperatureReadings, useHumidityReadings } from './useMeasurements';

// Error monitoring hooks
export { useErrorLogs } from './useErrorLogs';

// Utility hooks
export { useDebouncedRefetch } from './useDebouncedRefetch';