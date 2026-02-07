import { useEffect, useRef } from 'react';
import { useSensors } from './useSensors';
import { updateFavicon, getAirQualityLevel, type AirQualityLevel } from '~/utils/faviconGenerator';
import { env } from '~/env.js';

const DEFAULT_TITLE = 'AirQ Dashboard';

/**
 * Hook that provides glanceable status by updating:
 * - Browser favicon color based on air quality (green/yellow/red)
 * - Browser tab title with current CO2 reading
 *
 * Uses the worst air quality reading across all active sensors.
 */
export function useGlanceableStatus(): void {
  const { sensors } = useSensors({
    includeLastReading: true,
    pollInterval: env.NEXT_PUBLIC_POLL_INTERVAL_MS,
    fetchPolicy: 'cache-and-network',
  });

  const lastLevelRef = useRef<AirQualityLevel>('unknown');
  const lastTitleRef = useRef<string>(DEFAULT_TITLE);

  useEffect(() => {
    // Skip if no sensors or running on server
    if (typeof window === 'undefined') return;

    const activeSensors = sensors?.filter(s => s.isActive && s.lastReading) ?? [];

    if (activeSensors.length === 0) {
      // No active sensors - show unknown state
      if (lastLevelRef.current !== 'unknown') {
        updateFavicon('unknown');
        lastLevelRef.current = 'unknown';
      }
      if (lastTitleRef.current !== DEFAULT_TITLE) {
        document.title = DEFAULT_TITLE;
        lastTitleRef.current = DEFAULT_TITLE;
      }
      return;
    }

    // Get CO2 readings from all active sensors
    const co2Readings = activeSensors
      .map(s => s.lastReading?.co2Reading?.co2Ppm)
      .filter((ppm): ppm is number => ppm !== undefined && ppm !== null);

    if (co2Readings.length === 0) {
      return;
    }

    // Use the worst (highest) CO2 reading for both favicon and title
    const worstCo2 = Math.max(...co2Readings);

    // Determine air quality level based on worst reading
    const level = getAirQualityLevel(worstCo2);

    // Update favicon only if level changed
    if (level !== lastLevelRef.current) {
      updateFavicon(level);
      lastLevelRef.current = level;
    }

    // Update title with highest CO2
    const newTitle = `${worstCo2} ppm — AirQ`;
    if (newTitle !== lastTitleRef.current) {
      document.title = newTitle;
      lastTitleRef.current = newTitle;
    }
  }, [sensors]);

  // Cleanup: restore default title on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        document.title = DEFAULT_TITLE;
      }
    };
  }, []);
}
