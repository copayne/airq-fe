import { describe, it, expect } from 'vitest';
import { formatSensorDetails } from '../sensorFormatters';
import type { Sensor } from '~/types/sensors';

describe('formatSensorDetails', () => {
  it('returns empty defaults for undefined sensor', () => {
    const result = formatSensorDetails(undefined);
    expect(result.co2).toBe(0);
    expect(result.humidity).toBe('--');
    expect(result.temp).toBe('--');
    expect(result.temperatureFahrenheit).toBe('--');
    expect(result.isActive).toBe(false);
    expect(result.currentLocation).toBe('');
  });

  it('formats a sensor with full readings', () => {
    const sensor = {
      id: '1',
      name: 'Test',
      model: 'SCD30',
      isActive: true,
      currentLocation: { id: '1', name: 'Living Room' },
      lastReading: {
        id: '1',
        readingTime: '2024-06-15T12:00:00Z',
        isSuccess: true,
        co2Reading: { co2Ppm: 450 },
        temperatureReading: { temperatureCelsius: 22.5 },
        humidityReading: { humidityPercentage: 45.678 },
      },
    } as unknown as Sensor;

    const result = formatSensorDetails(sensor);
    expect(result.co2).toBe(450);
    expect(result.co2Raw).toBe(450);
    expect(result.humidity).toBe('45.7');
    expect(result.humidityRaw).toBe(45.678);
    expect(result.temp).toBe('22.5');
    expect(result.tempRaw).toBe(22.5);
    expect(result.temperatureFahrenheit).toBe('73'); // (22.5 * 9/5 + 32) = 72.5, toFixed(0) = '73'
    expect(result.isActive).toBe(true);
    expect(result.currentLocation).toBe('living room');
  });

  it('handles sensor with no last reading', () => {
    const sensor = {
      id: '1',
      name: 'Test',
      model: 'SCD30',
      isActive: true,
      currentLocation: null,
      lastReading: null,
    } as unknown as Sensor;

    const result = formatSensorDetails(sensor);
    expect(result.co2).toBe('--');
    expect(result.co2Raw).toBe(0);
    expect(result.temp).toBe('--');
    expect(result.humidity).toBe('--');
  });

  it('handles partial readings (missing humidity)', () => {
    const sensor = {
      id: '1',
      name: 'Test',
      model: 'SCD30',
      isActive: true,
      currentLocation: null,
      lastReading: {
        id: '1',
        readingTime: '2024-06-15T12:00:00Z',
        isSuccess: true,
        co2Reading: { co2Ppm: 500 },
        temperatureReading: { temperatureCelsius: 20 },
        humidityReading: null,
      },
    } as unknown as Sensor;

    const result = formatSensorDetails(sensor);
    expect(result.co2).toBe(500);
    expect(result.humidity).toBe('--');
    expect(result.humidityRaw).toBe(0);
  });
});

