# AirQ Frontend API Integration Summary

## Overview
This document summarizes the comprehensive updates made to integrate all available backend API endpoints into the AirQ frontend application.

## Changes Made

### 1. Updated Apollo Client Configuration
**File:** `/src/lib/apolloClient.ts`

- **Updated GraphQL Type Definitions**: Added complete type definitions for all backend objects
- **Fixed Field Name Mismatches**: Corrected input field names to match backend expectations
- **Enhanced Cache Policies**: Added proper cache key fields for all object types
- **Added Missing Queries**: Added all missing queries to the Query type
- **Added CreateSensorReading Mutation**: Added the missing mutation with proper response structure

**Key Updates:**
- Added `ErrorLogObject`, `SensorLocationObject` with complete field definitions
- Added `CreateSensorReadingInput` and `CreateSensorReadingPayload` types
- Updated cache policies for better performance
- Fixed `RegisterInput` to use `first_name`/`last_name` instead of `firstName`/`lastName`

### 2. New GraphQL Fragments
**File:** `/src/graphql/fragments.ts`

Added comprehensive fragments for all object types:
- `ERROR_LOG_FRAGMENT` - Error log information
- `SENSOR_LOCATION_FRAGMENT` - Sensor location mappings
- `CO2_READING_FRAGMENT` - Individual CO2 readings
- `TEMPERATURE_READING_FRAGMENT` - Individual temperature readings  
- `HUMIDITY_READING_FRAGMENT` - Individual humidity readings

### 3. New GraphQL Query Files

#### Error Logs
**File:** `/src/graphql/ErrorLog.ts`
- `GET_ERROR_LOGS` - Query all error logs

#### Sensor Locations
**File:** `/src/graphql/SensorLocation.ts`
- `GET_SENSOR_LOCATIONS` - Query all sensor location mappings

#### Individual Measurements
**File:** `/src/graphql/Measurements.ts`
- `GET_CO2_READINGS` - Query all CO2 readings
- `GET_TEMPERATURE_READINGS` - Query all temperature readings
- `GET_HUMIDITY_READINGS` - Query all humidity readings

### 4. Updated Existing GraphQL Files

#### Sensor Readings
**File:** `/src/graphql/SensorReading.ts`
- Added `GET_SENSOR_READINGS` - Query recent sensor readings (limited to 1000)
- Fixed `CREATE_SENSOR_READING` mutation to include `success`, `message`, and `errors` fields

### 5. New React Hooks

#### Error Monitoring
**File:** `/src/hooks/useErrorLogs.ts`
- `useErrorLogs()` - Hook for fetching and managing error logs

#### Sensor Management
**File:** `/src/hooks/useSensorLocations.ts`
- `useSensorLocations()` - Hook for sensor location mappings

#### Individual Measurements
**File:** `/src/hooks/useMeasurements.ts`
- `useCO2Readings()` - Hook for CO2 readings
- `useTemperatureReadings()` - Hook for temperature readings
- `useHumidityReadings()` - Hook for humidity readings

#### Single Entity Queries
**File:** `/src/hooks/useSingleEntities.ts`
- `useUserById(id)` - Hook for fetching user by ID (admin only)

#### User Management
**File:** `/src/hooks/useUsers.ts`
- `useUsers()` - Hook for fetching all users (admin only)

#### Recent Readings
**File:** `/src/hooks/useRecentSensorReadings.ts`
- `useRecentSensorReadings()` - Hook for recent sensor readings

#### Data Creation
**File:** `/src/hooks/useCreateSensorReading.ts`
- `useCreateSensorReading()` - Hook for creating new sensor readings

### 6. Centralized Hook Exports
**File:** `/src/hooks/index.ts`
- Created centralized export file for all hooks
- Organized by category (auth, sensor data, measurements, etc.)

### 7. Fixed Component Integration

#### Register Form
**File:** `/src/components/auth/RegisterForm.tsx`
- Fixed field name mapping from `firstName`/`lastName` to `first_name`/`last_name`
- Maintained UI consistency while ensuring backend compatibility

#### Type Definitions  
**File:** `/src/types/auth.ts`
- Updated `RegisterInput` interface to use correct field names

## API Coverage

### Queries Now Available
- ✅ `sensors` - All sensors with relationships
- ✅ `locations` - All locations
- ✅ `sensorLocations` - Sensor location mappings  
- ✅ `sensorReadings` - Recent sensor readings (limited to 1000)
- ✅ `humidityReadings` - Individual humidity readings
- ✅ `temperatureReadings` - Individual temperature readings
- ✅ `co2Readings` - Individual CO2 readings
- ✅ `errorLogs` - Error logs
- ✅ `filteredSensorReadings(filters)` - Advanced filtered readings
- ✅ `me` - Current authenticated user
- ✅ `users` - All users (admin only)
- ✅ `sensor(id)` - Single sensor by ID
- ✅ `location(id)` - Single location by ID
- ✅ `user(id)` - Single user by ID (admin only)

### Mutations Now Available
- ✅ `createSensorReading` - Create new sensor reading with validation
- ✅ `registerUser` - User registration with email verification
- ✅ `loginUser` - User authentication
- ✅ `verifyEmail` - Email verification
- ✅ `requestPasswordReset` - Request password reset
- ✅ `resetPassword` - Reset password with token
- ✅ `logoutUser` - Secure logout with token blacklisting

## Key Features

### Comprehensive Error Handling
- All hooks include proper error handling
- Partial data support with `errorPolicy: 'all'`
- Network status change notifications

### Performance Optimizations
- Proper cache key configurations
- Optimized refetch strategies
- Debounced refetch for filtered queries
- Cache-and-network policies for fresh data

### Type Safety
- Complete TypeScript interfaces for all data types
- Proper GraphQL type definitions
- Type-safe hook implementations

### Authentication Integration
- Complete auth flow support
- Field name corrections for backend compatibility
- Admin-only query protection

## Usage Examples

### Basic Sensor Data
```typescript
import { useRecentSensorReadings } from '~/hooks';

function SensorDashboard() {
  const { sensorReadings, loading, error } = useRecentSensorReadings();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {sensorReadings.map(reading => (
        <div key={reading.id}>{/* render reading */}</div>
      ))}
    </div>
  );
}
```

### Error Monitoring
```typescript
import { useErrorLogs } from '~/hooks';

function ErrorMonitor() {
  const { errorLogs, loading, refetch } = useErrorLogs();
  
  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {errorLogs.map(log => (
        <div key={log.id}>
          {log.errorType}: {log.errorMessage}
        </div>
      ))}
    </div>
  );
}
```

### Creating Sensor Readings
```typescript
import { useCreateSensorReading } from '~/hooks';

function SensorDataForm() {
  const { createSensorReading, loading } = useCreateSensorReading();
  
  const handleSubmit = async (data) => {
    const result = await createSensorReading({
      sensorId: 1,
      co2Ppm: 1200,
      temperatureCelsius: 23.5,
      humidityPercentage: 65.2
    });
    
    if (result?.success) {
      console.log('Reading created:', result.sensorReading);
    } else {
      console.error('Errors:', result?.errors);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## Next Steps

1. **Testing**: Create comprehensive test suite for all new integrations
2. **Component Updates**: Update existing components to use new API endpoints where beneficial
3. **Documentation**: Create user documentation for new features
4. **Performance Monitoring**: Monitor query performance and optimize as needed

## Backend Compatibility

All frontend implementations now match the backend schema exactly:
- Field names use correct casing (snake_case for inputs, camelCase for outputs)
- Response structures match backend exactly
- Error handling follows backend patterns
- Authentication flows are fully compatible