// Centralized color classification logic for air quality metrics
// This file provides consistent threshold-based styling across the application

export interface ColorClasses {
  inner: string;
  outer: string;
}

export interface ExtendedColorClasses extends ColorClasses {
  blur: string;
}

/**
 * Get color classes based on CO2 PPM value
 * Thresholds:
 * - <= 800 PPM: Good (primary/green)
 * - 800-999 PPM: Moderate (secondary/yellow)
 * - >= 1000 PPM: Poor (tertiary/red)
 */
export function getCO2ColorClasses(value: number | null): ExtendedColorClasses {
  if (value === null) {
    return {
      inner: 'bg-airq-light text-airq-dark',
      outer: 'bg-airq-light/25',
      blur: 'rgba(243, 244, 255, 0.5)'
    };
  }

  if (value <= 800) {
    return {
      inner: 'bg-airq-primary text-airq-light',
      outer: 'bg-airq-primary/25',
      blur: 'rgba(19, 117, 71, 0.5)'
    };
  }

  if (value < 1000) {
    return {
      inner: 'bg-airq-secondary text-airq-dark',
      outer: 'bg-airq-secondary/25',
      blur: 'rgba(255, 201, 20, 0.5)'
    };
  }

  return {
    inner: 'bg-airq-tertiary text-airq-light',
    outer: 'bg-airq-tertiary/25',
    blur: 'rgba(237, 76, 76, 0.5)'
  };
}

/**
 * Get color classes based on temperature in Fahrenheit
 * Thresholds:
 * - < 74°F (23.3°C): Good (primary/green)
 * - 74-76°F (23.3-25°C): Moderate (secondary/yellow)
 * - >= 77°F (25°C): Poor (tertiary/red)
 */
export function getTemperatureFahrenheitColorClasses(fahrenheit: number | null): ExtendedColorClasses {
  if (fahrenheit === null) {
    return {
      inner: 'bg-airq-light text-airq-dark',
      outer: 'bg-airq-light/25',
      blur: 'rgba(243, 244, 255, 0.5)'
    };
  }

  if (fahrenheit < 74) {
    return {
      inner: 'bg-airq-primary text-airq-light',
      outer: 'bg-airq-primary/25',
      blur: 'rgba(19, 117, 71, 0.5)'
    };
  }

  if (fahrenheit < 77) {
    return {
      inner: 'bg-airq-secondary text-airq-dark',
      outer: 'bg-airq-secondary/25',
      blur: 'rgba(255, 201, 20, 0.5)'
    };
  }

  return {
    inner: 'bg-airq-tertiary text-airq-light',
    outer: 'bg-airq-tertiary/25',
    blur: 'rgba(237, 76, 76, 0.5)'
  };
}

/**
 * Get color classes based on temperature in Celsius
 * Thresholds:
 * - < 23.33°C (74°F): Good (primary/green)
 * - 23.33-24.99°C (74-76°F): Moderate (secondary/yellow)
 * - >= 25°C (77°F): Poor (tertiary/red)
 */
export function getTemperatureCelsiusColorClasses(celsius: number | null): ColorClasses {
  if (celsius === null) {
    return {
      inner: 'bg-airq-light text-airq-dark',
      outer: 'bg-airq-light/25'
    };
  }

  if (celsius < 23.33) {
    return {
      inner: 'bg-airq-primary text-airq-light',
      outer: 'bg-airq-primary/25'
    };
  }

  if (celsius < 25) {
    return {
      inner: 'bg-airq-secondary text-airq-dark',
      outer: 'bg-airq-secondary/25'
    };
  }

  return {
    inner: 'bg-airq-tertiary text-airq-light',
    outer: 'bg-airq-tertiary/25'
  };
}

/**
 * Get color classes based on humidity percentage
 * Thresholds:
 * - 30-60%: Good (primary/green)
 * - 25-30% or 60-70%: Moderate (secondary/yellow)
 * - < 25% or > 70%: Poor (tertiary/red)
 */
export function getHumidityColorClasses(percentage: number | null): ColorClasses {
  if (percentage === null) {
    return {
      inner: 'bg-airq-light text-airq-dark',
      outer: 'bg-airq-light/25'
    };
  }

  // Good range: 30-60%
  if (percentage > 30 && percentage < 60) {
    return {
      inner: 'bg-airq-primary text-airq-light',
      outer: 'bg-airq-primary/25'
    };
  }

  // Moderate range: 25-30% or 60-70%
  if ((percentage > 25 && percentage <= 30) || (percentage >= 60 && percentage < 70)) {
    return {
      inner: 'bg-airq-secondary text-airq-dark',
      outer: 'bg-airq-secondary/25'
    };
  }

  // Poor range: < 25% or >= 70%
  return {
    inner: 'bg-airq-tertiary text-airq-light',
    outer: 'bg-airq-tertiary/25'
  };
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number | null): number | null {
  if (celsius === null) return null;
  return (celsius * 9/5) + 32;
}
