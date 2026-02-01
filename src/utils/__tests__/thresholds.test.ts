import { describe, it, expect } from 'vitest';
import {
  getCO2ColorClasses,
  getTemperatureFahrenheitColorClasses,
  getTemperatureCelsiusColorClasses,
  getHumidityColorClasses,
  celsiusToFahrenheit,
} from '../thresholds';

describe('getCO2ColorClasses', () => {
  const cases: { value: number | null; expected: string }[] = [
    { value: null, expected: 'bg-airq-light' },
    { value: 400, expected: 'bg-airq-primary' },
    { value: 800, expected: 'bg-airq-primary' },   // boundary: <= 800 is good
    { value: 801, expected: 'bg-airq-secondary' },
    { value: 999, expected: 'bg-airq-secondary' },
    { value: 1000, expected: 'bg-airq-tertiary' },
    { value: 2000, expected: 'bg-airq-tertiary' },
  ];

  it.each(cases)('CO2 $value → $expected', ({ value, expected }) => {
    expect(getCO2ColorClasses(value).inner).toContain(expected);
  });

  it('returns blur property', () => {
    expect(getCO2ColorClasses(400).blur).toBeDefined();
  });
});

describe('getTemperatureFahrenheitColorClasses', () => {
  const cases: { value: number | null; expected: string }[] = [
    { value: null, expected: 'bg-airq-light' },
    { value: 60, expected: 'bg-airq-primary' },
    { value: 67, expected: 'bg-airq-primary' },   // < 68 is good
    { value: 68, expected: 'bg-airq-secondary' },  // boundary
    { value: 80, expected: 'bg-airq-secondary' },
    { value: 81, expected: 'bg-airq-tertiary' },
    { value: 100, expected: 'bg-airq-tertiary' },
  ];

  it.each(cases)('$value°F → $expected', ({ value, expected }) => {
    expect(getTemperatureFahrenheitColorClasses(value).inner).toContain(expected);
  });
});

describe('getTemperatureCelsiusColorClasses', () => {
  const cases: { value: number | null; expected: string }[] = [
    { value: null, expected: 'bg-airq-light' },
    { value: 15, expected: 'bg-airq-primary' },
    { value: 19, expected: 'bg-airq-primary' },    // < 20 is good
    { value: 20, expected: 'bg-airq-secondary' },   // boundary
    { value: 26, expected: 'bg-airq-secondary' },   // <= 26 is moderate
    { value: 27, expected: 'bg-airq-tertiary' },
  ];

  it.each(cases)('$value°C → $expected', ({ value, expected }) => {
    expect(getTemperatureCelsiusColorClasses(value).inner).toContain(expected);
  });

  it('does not have blur property (returns ColorClasses, not Extended)', () => {
    const result = getTemperatureCelsiusColorClasses(20);
    expect(result).not.toHaveProperty('blur');
  });
});

describe('getHumidityColorClasses', () => {
  const cases: { value: number | null; expected: string }[] = [
    { value: null, expected: 'bg-airq-light' },
    { value: 45, expected: 'bg-airq-primary' },    // 30-60 good
    { value: 28, expected: 'bg-airq-secondary' },   // 25-30 moderate
    { value: 65, expected: 'bg-airq-secondary' },   // 60-70 moderate
    { value: 20, expected: 'bg-airq-tertiary' },    // < 25 poor
    { value: 75, expected: 'bg-airq-tertiary' },    // > 70 poor
  ];

  it.each(cases)('$value% → $expected', ({ value, expected }) => {
    expect(getHumidityColorClasses(value).inner).toContain(expected);
  });

  // Boundary tests
  it('25% is poor (not moderate, since condition is > 25)', () => {
    expect(getHumidityColorClasses(25).inner).toContain('bg-airq-tertiary');
  });

  it('30% is moderate (condition is <= 30)', () => {
    expect(getHumidityColorClasses(30).inner).toContain('bg-airq-secondary');
  });

  it('60% is moderate (condition is >= 60)', () => {
    expect(getHumidityColorClasses(60).inner).toContain('bg-airq-secondary');
  });

  it('70% is poor (condition is >= 70)', () => {
    expect(getHumidityColorClasses(70).inner).toContain('bg-airq-tertiary');
  });
});

describe('celsiusToFahrenheit', () => {
  it('returns null for null input', () => {
    expect(celsiusToFahrenheit(null)).toBeNull();
  });

  it('converts 0°C → 32°F', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it('converts 100°C → 212°F', () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it('converts -40°C → -40°F', () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });

  it('converts 22°C correctly', () => {
    expect(celsiusToFahrenheit(22)).toBeCloseTo(71.6);
  });
});
