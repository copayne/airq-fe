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
 * - < 68°F (20°C): Good (primary/green)
 * - 68-80°F (20-27°C): Moderate (secondary/yellow)
 * - >= 81°F (27°C): Poor (tertiary/red)
 */
export function getTemperatureFahrenheitColorClasses(fahrenheit: number | null): ExtendedColorClasses {
  if (fahrenheit === null) {
    return {
      inner: 'bg-airq-light text-airq-dark',
      outer: 'bg-airq-light/25',
      blur: 'rgba(243, 244, 255, 0.5)'
    };
  }

  if (fahrenheit < 68) {
    return {
      inner: 'bg-airq-primary text-airq-light',
      outer: 'bg-airq-primary/25',
      blur: 'rgba(19, 117, 71, 0.5)'
    };
  }

  if (fahrenheit < 81) {
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
 * - < 20°C: Good (primary/green)
 * - 20-26°C: Moderate (secondary/yellow)
 * - >= 27°C: Poor (tertiary/red)
 */
export function getTemperatureCelsiusColorClasses(celsius: number | null): ColorClasses {
  if (celsius === null) {
    return {
      inner: 'bg-airq-light text-airq-dark',
      outer: 'bg-airq-light/25'
    };
  }

  if (celsius < 20) {
    return {
      inner: 'bg-airq-primary text-airq-light',
      outer: 'bg-airq-primary/25'
    };
  }

  if (celsius <= 26) {
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
