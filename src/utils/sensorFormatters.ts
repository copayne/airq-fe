import type { Sensor } from '~/types/sensors';

/**
 * Formatted sensor details for display
 */
export interface FormattedSensorDetails {
  co2: number | string;
  co2Raw: number;
  currentLocation: string;
  humidity: string;
  humidityRaw: number;
  isActive: boolean;
  lastReading: string;
  temp: string;
  tempRaw: number;
  temperatureFahrenheit: string;
}

/**
 * Default empty sensor details for when no sensor data is available
 */
const EMPTY_SENSOR_DETAILS: FormattedSensorDetails = {
  co2: 0,
  co2Raw: 0,
  currentLocation: '',
  humidity: '--',
  humidityRaw: 0,
  isActive: false,
  lastReading: '--',
  temp: '--',
  tempRaw: 0,
  temperatureFahrenheit: '--',
};

/**
 * Extracts and formats sensor reading details for display.
 * Handles null/undefined values gracefully with fallback display values.
 *
 * @param sensor The sensor object with optional last reading data
 * @returns Formatted sensor details with both raw numeric and display string values
 *
 * @example
 * ```typescript
 * const details = formatSensorDetails(sensor);
 * console.log(details.temperatureFahrenheit); // "72°F"
 * console.log(details.co2); // "450 ppm"
 * ```
 */
export function formatSensorDetails(sensor: Sensor | undefined): FormattedSensorDetails {
  if (!sensor) {
    return EMPTY_SENSOR_DETAILS;
  }

  const lastReading = sensor.lastReading;
  const co2 = lastReading?.co2Reading?.co2Ppm ?? '--';
  const humidityRaw = lastReading?.humidityReading?.humidityPercentage;
  const humidity = humidityRaw !== undefined && humidityRaw !== null
    ? humidityRaw.toFixed(1)
    : '--';
  const tempCelsius = lastReading?.temperatureReading?.temperatureCelsius;
  const temperatureFahrenheit = tempCelsius !== undefined && tempCelsius !== null
    ? ((tempCelsius * 9) / 5 + 32).toFixed(0)
    : '--';

  return {
    co2,
    co2Raw: typeof co2 === 'number' ? co2 : 0,
    currentLocation: sensor.currentLocation?.name?.toLowerCase() ?? '',
    humidity,
    humidityRaw: humidityRaw ?? 0,
    isActive: lastReading?.isSuccess ?? false,
    lastReading: lastReading ? new Date(lastReading.readingTime).toLocaleString() : '--',
    temp: tempCelsius !== undefined && tempCelsius !== null ? tempCelsius.toFixed(1) : '--',
    tempRaw: tempCelsius ?? 0,
    temperatureFahrenheit,
  };
}

/**
 * Formats a timestamp for display
 *
 * @param timestamp ISO 8601 timestamp string
 * @returns Formatted date/time string in locale format
 */
export function formatReadingTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return '--';
  }
}

/**
 * Formats a number to a fixed precision or returns a fallback
 *
 * @param value The numeric value to format
 * @param precision Number of decimal places (default: 1)
 * @param fallback Fallback string when value is null/undefined (default: '--')
 * @returns Formatted number string or fallback
 */
export function formatNumericValue(
  value: number | null | undefined,
  precision = 1,
  fallback = '--'
): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  return value.toFixed(precision);
}
