# Frontend Cleanup Plan

Comprehensive audit of `/home/copayne/dev/airq/airq-fe/src/` identifying dead code, unused dependencies, schema mismatches, and simplification opportunities.

---

## Priority Legend

- **P0 - Critical**: Broken code referencing non-existent backend endpoints (will cause runtime errors)
- **P1 - High**: Fully dead files that can be deleted entirely
- **P2 - Medium**: Dead exports within otherwise-used files
- **P3 - Low**: Minor cleanup and simplification opportunities

---

## 1. Dead GraphQL Operations (Queries/Mutations Referencing Non-Existent Backend Endpoints)

These frontend GraphQL operations reference queries that **do not exist** in the backend schema at `/home/copayne/dev/airq/airq-api/app/schema.py`. They will fail at runtime if ever called.

### P0-1: `src/graphql/Measurements.ts` (entire file)

- **What**: Defines `GET_CO2_READINGS`, `GET_TEMPERATURE_READINGS`, `GET_HUMIDITY_READINGS`
- **Problem**: The backend has no `co2Readings`, `temperatureReadings`, or `humidityReadings` top-level queries. These standalone measurement queries were removed from the backend.
- **Consumers**: Only `src/hooks/useMeasurements.ts` imports from this file.
- **Safe to remove**: Yes. No component imports from `useMeasurements`.
- **Action**: Delete `src/graphql/Measurements.ts`

### P0-2: `src/graphql/ErrorLog.ts` (entire file)

- **What**: Defines `GET_ERROR_LOGS` querying `errorLogs { ...ErrorLogInfo }`
- **Problem**: The backend has no `errorLogs` or `error_logs` query. This endpoint was removed.
- **Consumers**: Only `src/hooks/useErrorLogs.ts` imports from this file.
- **Safe to remove**: Yes. No component imports from `useErrorLogs`.
- **Action**: Delete `src/graphql/ErrorLog.ts`

---

## 2. Dead Hooks (Exported but Never Imported by Any Component)

### P1-1: `src/hooks/useMeasurements.ts` (entire file)

- **What**: Exports `useCO2Measurements`, `useTemperatureMeasurements`, `useHumidityMeasurements`
- **Problem**: None of these hooks are imported anywhere. They also reference the dead `Measurements.ts` GraphQL operations (see P0-1).
- **Safe to remove**: Yes. Not imported by any component or re-exported from `index.ts`.
- **Action**: Delete `src/hooks/useMeasurements.ts`

### P1-2: `src/hooks/useErrorLogs.ts` (entire file)

- **What**: Exports `useErrorLogs`
- **Problem**: Not imported anywhere. References the dead `ErrorLog.ts` GraphQL operation (see P0-2).
- **Safe to remove**: Yes. Not re-exported from `index.ts`.
- **Action**: Delete `src/hooks/useErrorLogs.ts`

### P1-3: `src/hooks/useRingDevices.ts` (entire file)

- **What**: Exports `useRingDevices` -- a hook for polling Ring device data via GraphQL
- **Problem**: Not imported by any component. The Ring integration uses `RingController` and `RingContext` instead, which manage devices through their own flow.
- **Safe to remove**: Yes. No imports found anywhere.
- **Action**: Delete `src/hooks/useRingDevices.ts`

### P1-4: `src/hooks/useRealtimeReadings.ts` (entire file)

- **What**: Exports `useRealtimeReadings` -- listens for WebSocket events and refetches Apollo queries
- **Problem**: Not imported or called by any component. The realtime functionality exists in `RealtimeContext` but this specific hook is never consumed.
- **Safe to remove**: Yes. No imports found.
- **Action**: Delete `src/hooks/useRealtimeReadings.ts`

### P1-5: `src/hooks/useUsers.ts` (entire file)

- **What**: Exports `useUsers` -- fetches all users (admin only)
- **Problem**: Only imported by `hooks/index.ts` for re-export, but no component ever imports `useUsers`. The admin user list feature does not exist in the frontend.
- **Safe to remove**: Yes. Remove file and remove re-export from `hooks/index.ts` line 4.
- **Action**: Delete `src/hooks/useUsers.ts`, update `src/hooks/index.ts`

### P1-6: `src/hooks/useSingleEntities.ts` (entire file)

- **What**: Exports `useUserById` -- fetches a single user by ID (admin only)
- **Problem**: Only imported by `hooks/index.ts` for re-export, but no component ever imports `useUserById`. The admin user detail feature does not exist in the frontend.
- **Safe to remove**: Yes. Remove file and remove re-export from `hooks/index.ts` line 5.
- **Action**: Delete `src/hooks/useSingleEntities.ts`, update `src/hooks/index.ts`

### P1-7: `src/hooks/useCreateSensorReading.ts` (entire file)

- **What**: Exports `useCreateSensorReading` -- mutation hook for creating sensor readings
- **Problem**: Only imported by `hooks/index.ts` for re-export, but no component ever calls it. Sensor readings are created by the IoT sensors hitting the backend directly, not through the frontend.
- **Safe to remove**: Yes. Remove file and remove re-export from `hooks/index.ts` line 10.
- **Action**: Delete `src/hooks/useCreateSensorReading.ts`, update `src/hooks/index.ts`

---

## 3. Dead Utility Files and Libraries

### P1-8: `src/lib/apolloUtils.ts` (entire file)

- **What**: Exports `clearCache`, `cleanupCache`, `refreshAllQueries`
- **Problem**: Not imported anywhere in the codebase.
- **Safe to remove**: Yes.
- **Action**: Delete `src/lib/apolloUtils.ts`

### P1-9: `src/components/settings/calibration/SensorCalibration.tsx` (empty file)

- **What**: An empty file (0 bytes)
- **Problem**: Contains no code, not imported anywhere.
- **Safe to remove**: Yes.
- **Action**: Delete `src/components/settings/calibration/SensorCalibration.tsx`

### P1-10: `src/components/apollo/ErrorBoundary.tsx` (entire file)

- **What**: Exports `GraphQLErrorBoundary` -- an error boundary class component
- **Problem**: Not imported or used anywhere in the application.
- **Safe to remove**: Yes.
- **Action**: Delete `src/components/apollo/ErrorBoundary.tsx` and the `src/components/apollo/` directory

---

## 4. Dead GraphQL Query Exports (Within Otherwise-Used Files)

### P2-1: `GET_FILTERED_SENSOR_READINGS_BASIC` in `src/graphql/SensorReading.ts:15`

- **What**: A lightweight version of the filtered sensor readings query
- **Problem**: Defined but never imported anywhere. Only `GET_FILTERED_SENSOR_READINGS` and `GET_SENSOR_READINGS` and `CREATE_SENSOR_READING` are used.
- **Safe to remove**: Yes.
- **Action**: Remove the `GET_FILTERED_SENSOR_READINGS_BASIC` export from `SensorReading.ts`

### P2-2: `GET_SENSOR` in `src/graphql/Sensor.ts:40`

- **What**: Query for fetching a single sensor by ID
- **Problem**: Defined but never imported anywhere.
- **Safe to remove**: Yes.
- **Action**: Remove the `GET_SENSOR` export from `Sensor.ts`

### P2-3: `GET_LOCATION` in `src/graphql/Location.ts:18`

- **What**: Query for fetching a single location by ID
- **Problem**: Defined but never imported anywhere.
- **Safe to remove**: Yes.
- **Action**: Remove the `GET_LOCATION` export from `Location.ts`

### P2-4: `GET_CURRENT_ASSIGNMENTS` in `src/graphql/SensorLocation.ts:15`

- **What**: An alternative query for fetching only current sensor-location assignments
- **Problem**: Defined but never imported. `GET_SENSOR_LOCATIONS` is used instead.
- **Safe to remove**: Yes.
- **Action**: Remove the `GET_CURRENT_ASSIGNMENTS` export from `SensorLocation.ts`

### P2-5: `GET_DASHBOARD_LAYOUT` in `src/graphql/DashboardLayout.ts:26`

- **What**: Query for fetching a single dashboard layout by ID
- **Problem**: Defined but never imported. The app uses `GET_DASHBOARD_LAYOUTS` (plural) and `GET_LAST_USED_LAYOUT` instead.
- **Safe to remove**: Yes.
- **Action**: Remove the `GET_DASHBOARD_LAYOUT` export from `DashboardLayout.ts`

### P2-6: `GET_USERS` in `src/graphql/auth.ts:62`

- **What**: Query for fetching all users (admin only)
- **Problem**: Only imported by the dead `useUsers.ts` hook. Once that hook is deleted, this becomes dead.
- **Safe to remove**: Yes (after P1-5).
- **Action**: Remove the `GET_USERS` export from `auth.ts`

### P2-7: `GET_USER` in `src/graphql/auth.ts:72`

- **What**: Query for fetching a user by ID (admin only)
- **Problem**: Only imported by the dead `useSingleEntities.ts` hook. Once that hook is deleted, this becomes dead.
- **Safe to remove**: Yes (after P1-6).
- **Action**: Remove the `GET_USER` export from `auth.ts`

---

## 5. Dead Fragment Exports

### P2-8: `ERROR_LOG_FRAGMENT` in `src/graphql/fragments.ts:87`

- **What**: GraphQL fragment for error log fields
- **Problem**: Only used by the dead `ErrorLog.ts` file. Once that is deleted, this fragment is dead.
- **Safe to remove**: Yes (after P0-2).
- **Action**: Remove the `ERROR_LOG_FRAGMENT` export from `fragments.ts`

### P2-9: `CO2_READING_FRAGMENT`, `TEMPERATURE_READING_FRAGMENT`, `HUMIDITY_READING_FRAGMENT` in `src/graphql/fragments.ts:118-139`

- **What**: Individual measurement reading fragments
- **Problem**: Only used by the dead `Measurements.ts` file. Once that is deleted, these fragments are dead.
- **Safe to remove**: Yes (after P0-1).
- **Action**: Remove all three fragment exports from `fragments.ts`

---

## 6. Dead Type Exports

### P2-10: Types in `src/types/sensors.ts` that become dead after hook cleanup

After deleting the dead hooks, several type exports in `sensors.ts` will have no remaining consumers:

| Type | Line | Imported By (after cleanup) |
|------|------|-----------------------------|
| `RecentSensorReadingsData` | 115 | Nothing (only defined, never imported) |
| `CO2ReadingsData` | 123 | Nothing (only `useMeasurements.ts` used local copies) |
| `TemperatureReadingsData` | 127 | Same |
| `HumidityReadingsData` | 131 | Same |
| `CreateSensorReadingInput` | 103 | Only `useCreateSensorReading.ts` (being deleted) |
| `CreateSensorReadingPayload` | 135 | Same |
| `CreateSensorReadingData` | 142 | Same |
| `SensorInfo` | 31 | Nothing (never imported anywhere) |

- **Safe to remove**: Yes.
- **Action**: Remove all listed type exports from `sensors.ts`

### P2-11: Types in `src/types/auth.ts` that are never imported

| Type | Line | Status |
|------|------|--------|
| `AuthFormType` | 57 | Never imported by any file |
| `EmailVerificationStatus` | 98 | Never imported by any file |

- **Safe to remove**: Yes.
- **Action**: Remove both type exports from `auth.ts`

### P2-12: Types in `src/types/dashboard.ts` that are duplicated or unused

| Type | Line | Status |
|------|------|--------|
| `DashboardLayoutState` | 86 | Duplicated -- `DashboardLayoutContext.tsx` defines its own local version at line 100. The `dashboard.ts` version is never imported. |
| `DashboardLayoutAction` | 94 | Duplicated -- `DashboardLayoutContext.tsx` defines its own local version at line 109. The `dashboard.ts` version is never imported. |
| `FilterValue` | 62 | Never imported outside the file |
| `WidgetCriteria` | 49 | Never imported outside the file |

- **Safe to remove**: Yes.
- **Action**: Remove `DashboardLayoutState`, `DashboardLayoutAction`, `FilterValue`, and `WidgetCriteria` from `dashboard.ts`

---

## 7. Dead Utility Function Exports

### P2-13: `formatReadingTime` in `src/utils/sensorFormatters.ts:86`

- **What**: Thin wrapper around `formatDateTime`
- **Problem**: Never imported by any file. It is a trivial wrapper (`return formatDateTime(timestamp)`) that duplicates functionality.
- **Safe to remove**: Yes.
- **Action**: Remove the `formatReadingTime` function

### P2-14: `formatNumericValue` in `src/utils/sensorFormatters.ts:98`

- **What**: Formats a number to fixed precision or returns fallback
- **Problem**: Only imported in the test file (`sensorFormatters.test.ts`), never by any component.
- **Safe to remove**: Yes, along with its tests.
- **Action**: Remove the `formatNumericValue` function (keep tests for other functions)

### P2-15: `FormattedSensorDetails` interface in `src/utils/sensorFormatters.ts:7`

- **What**: Interface for the return type of `formatSensorDetails`
- **Problem**: Never imported by any consuming component -- they use type inference instead.
- **Safe to remove**: No -- it is the return type of `formatSensorDetails` and removing the export is harmless but it is still used internally. Keep the interface but optionally remove the `export` keyword.
- **Action**: Optionally remove `export` from the interface

### P2-16: `getWidgetsGroupedByCategory` in `src/config/widgetRegistry.ts:236`

- **What**: Groups widgets by category into a Map
- **Problem**: Never imported. `getWidgetsByCategory` is used directly instead.
- **Safe to remove**: Yes.
- **Action**: Remove the `getWidgetsGroupedByCategory` function

---

## 8. Dead Test and Backup Files

### P1-11: `src/hooks/__tests__/integration.test.ts.bak`

- **What**: A `.bak` backup of an old integration test file
- **Problem**: Not a valid test file (`.bak` extension). References many of the dead hooks/operations listed above.
- **Safe to remove**: Yes.
- **Action**: Delete `src/hooks/__tests__/integration.test.ts.bak`

---

## 9. Unused or Questionable NPM Dependencies

### P3-1: `geist` font package

- **What**: `"geist": "^1.3.0"` in `package.json`
- **Problem**: Not imported anywhere in `src/`. No `import` or `require` for `geist` found.
- **Investigation needed**: Check if it is referenced in CSS, `_document.tsx`, or Next.js config.
- **Action**: Investigate whether it is used in CSS/config files, remove if not

---

## 10. Redundant/Over-Engineered Patterns

### P3-2: `CREATE_SENSOR_READING` mutation in `src/graphql/SensorReading.ts:37`

- **What**: GraphQL mutation for creating sensor readings from the frontend
- **Problem**: After deleting `useCreateSensorReading.ts`, only `GET_SENSOR_READINGS` references it indirectly for cache invalidation. The mutation itself becomes unused since sensors post readings directly to the backend.
- **Note**: `GET_SENSOR_READINGS` is still used by `useCreateSensorReading` for refetchQueries. Once that hook is deleted, check if `CREATE_SENSOR_READING` has any remaining consumers.
- **Action**: Remove `CREATE_SENSOR_READING` from `SensorReading.ts` (after P1-7)

### P3-3: Duplicate `User` type definitions

- **What**: There are local `User` interface definitions in both `useUsers.ts:5` and `useSingleEntities.ts:8` that duplicate `src/types/auth.ts` `User` type
- **Problem**: These files are being deleted entirely, so this becomes moot.
- **Action**: No action needed (resolved by deletions above)

---

## 11. Summary of Changes

### Files to Delete (12 files)

1. `src/graphql/Measurements.ts`
2. `src/graphql/ErrorLog.ts`
3. `src/hooks/useMeasurements.ts`
4. `src/hooks/useErrorLogs.ts`
5. `src/hooks/useRingDevices.ts`
6. `src/hooks/useRealtimeReadings.ts`
7. `src/hooks/useUsers.ts`
8. `src/hooks/useSingleEntities.ts`
9. `src/hooks/useCreateSensorReading.ts`
10. `src/lib/apolloUtils.ts`
11. `src/components/settings/calibration/SensorCalibration.tsx` (empty)
12. `src/components/apollo/ErrorBoundary.tsx`

### Backup File to Delete (1 file)

13. `src/hooks/__tests__/integration.test.ts.bak`

### Files to Edit

14. **`src/hooks/index.ts`**: Remove re-exports of `useUsers`, `useUserById`, `useCreateSensorReading`
15. **`src/graphql/fragments.ts`**: Remove `ERROR_LOG_FRAGMENT`, `CO2_READING_FRAGMENT`, `TEMPERATURE_READING_FRAGMENT`, `HUMIDITY_READING_FRAGMENT`
16. **`src/graphql/SensorReading.ts`**: Remove `GET_FILTERED_SENSOR_READINGS_BASIC`, `CREATE_SENSOR_READING`
17. **`src/graphql/Sensor.ts`**: Remove `GET_SENSOR`
18. **`src/graphql/Location.ts`**: Remove `GET_LOCATION`
19. **`src/graphql/SensorLocation.ts`**: Remove `GET_CURRENT_ASSIGNMENTS`
20. **`src/graphql/DashboardLayout.ts`**: Remove `GET_DASHBOARD_LAYOUT`
21. **`src/graphql/auth.ts`**: Remove `GET_USERS`, `GET_USER`
22. **`src/types/sensors.ts`**: Remove `RecentSensorReadingsData`, `CO2ReadingsData`, `TemperatureReadingsData`, `HumidityReadingsData`, `CreateSensorReadingInput`, `CreateSensorReadingPayload`, `CreateSensorReadingData`, `SensorInfo`
23. **`src/types/auth.ts`**: Remove `AuthFormType`, `EmailVerificationStatus`
24. **`src/types/dashboard.ts`**: Remove `DashboardLayoutState`, `DashboardLayoutAction`, `FilterValue`, `WidgetCriteria`
25. **`src/utils/sensorFormatters.ts`**: Remove `formatReadingTime`, `formatNumericValue`
26. **`src/config/widgetRegistry.ts`**: Remove `getWidgetsGroupedByCategory`

### Estimated Impact

- **~13 files deleted** (includes 1 empty file, 1 backup)
- **~13 files edited** (removing dead exports)
- **~350 lines of dead code removed**
- **Zero functional changes** -- all removed code is completely unreachable

### Verification Steps

After cleanup:
1. Run `npm run build` to verify no import errors
2. Run `npm run lint` to verify no linting issues
3. Run `npm run test:run` to verify no test failures
4. Manual smoke test of the dashboard, settings pages, and auth flows
