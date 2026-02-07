import { useEffect, useRef } from 'react';
import { getAirQualityLevel, type AirQualityLevel } from '~/utils/faviconGenerator';

/**
 * Vibration patterns for different events (in milliseconds)
 */
const VIBRATION_PATTERNS = {
  // Short buzz for improvement
  improvement: [50],
  // Double buzz for degradation
  degradation: [50, 50, 100],
  // Triple short for critical (entering poor)
  critical: [100, 50, 100, 50, 100],
} as const;

/**
 * Check if haptic feedback (vibration) is supported
 */
function isHapticSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback with a specific pattern
 */
function triggerHaptic(pattern: number[]): void {
  if (isHapticSupported()) {
    navigator.vibrate(pattern);
  }
}

/**
 * Determine if the air quality improved, degraded, or stayed the same
 */
function getTransitionType(
  prevLevel: AirQualityLevel,
  newLevel: AirQualityLevel
): 'improvement' | 'degradation' | 'critical' | null {
  const levelOrder: AirQualityLevel[] = ['good', 'moderate', 'poor'];
  const prevIndex = levelOrder.indexOf(prevLevel);
  const newIndex = levelOrder.indexOf(newLevel);

  if (prevIndex === -1 || newIndex === -1 || prevIndex === newIndex) {
    return null;
  }

  if (newLevel === 'poor' && prevLevel !== 'poor') {
    return 'critical';
  }

  if (newIndex < prevIndex) {
    return 'improvement';
  }

  return 'degradation';
}

/**
 * Hook that provides haptic feedback when air quality thresholds are crossed.
 * Works on mobile devices that support the Vibration API.
 *
 * @param co2Ppm Current CO2 reading
 */
export function useHapticFeedback(co2Ppm: number | null): void {
  const previousLevel = useRef<AirQualityLevel>('unknown');

  useEffect(() => {
    if (co2Ppm === null) return;

    const currentLevel = getAirQualityLevel(co2Ppm);

    // Skip if unknown or same as before
    if (currentLevel === 'unknown' || previousLevel.current === 'unknown') {
      previousLevel.current = currentLevel;
      return;
    }

    const transition = getTransitionType(previousLevel.current, currentLevel);

    if (transition) {
      triggerHaptic([...VIBRATION_PATTERNS[transition]]);
    }

    previousLevel.current = currentLevel;
  }, [co2Ppm]);
}

/**
 * Standalone function to trigger haptic feedback for specific events
 */
export function hapticFeedback(type: keyof typeof VIBRATION_PATTERNS): void {
  triggerHaptic([...VIBRATION_PATTERNS[type]]);
}
