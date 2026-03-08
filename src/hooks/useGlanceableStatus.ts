import { useEffect, useRef } from 'react';
import { useSensors } from './useSensors';
import { updateFavicon, getAirQualityLevel, type AirQualityLevel } from '~/utils/faviconGenerator';
import { env } from '~/env.js';

const DEFAULT_TITLE = 'Hudson Air';

function getQualityLabel(avgCo2: number): string {
  if (avgCo2 <= 500) return 'Great';
  if (avgCo2 <= 800) return 'Good';
  if (avgCo2 < 1000) return 'Average';
  return 'Bad';
}

interface GlanceableStatusResult {
  worstCo2: number | null;
  level: AirQualityLevel;
}

/**
 * Hook that provides glanceable status by updating:
 * - Browser favicon color based on air quality (green/yellow/red)
 * - Browser tab title: "Hudson Air - Great/Good/Average/Bad"
 *
 * Only mounted on air quality pages (not news).
 * Uses the worst air quality reading across all active sensors for favicon.
 * Uses the average CO2 across all sensors for the quality label.
 * Returns the current worst CO2 reading for use with haptic/streak features.
 */
export function useGlanceableStatus(): GlanceableStatusResult {
  const { sensors } = useSensors({
    includeLastReading: true,
    pollInterval: env.NEXT_PUBLIC_POLL_INTERVAL_MS,
    fetchPolicy: 'cache-and-network',
  });

  const lastLevelRef = useRef<AirQualityLevel>('unknown');
  const lastTitleRef = useRef<string>(DEFAULT_TITLE);
  const currentWorstCo2Ref = useRef<number | null>(null);
  const currentLevelRef = useRef<AirQualityLevel>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const activeSensors = sensors?.filter(s => s.isActive && s.lastReading) ?? [];

    if (activeSensors.length === 0) {
      if (lastLevelRef.current !== 'unknown') {
        updateFavicon('unknown');
        lastLevelRef.current = 'unknown';
      }
      if (lastTitleRef.current !== DEFAULT_TITLE) {
        document.title = DEFAULT_TITLE;
        lastTitleRef.current = DEFAULT_TITLE;
      }
      currentWorstCo2Ref.current = null;
      currentLevelRef.current = 'unknown';
      return;
    }

    const co2Readings = activeSensors
      .map(s => s.lastReading?.co2Reading?.co2Ppm)
      .filter((ppm): ppm is number => ppm !== undefined && ppm !== null);

    if (co2Readings.length === 0) return;

    // Worst reading for favicon color
    const worstCo2 = Math.max(...co2Readings);
    currentWorstCo2Ref.current = worstCo2;

    const level = getAirQualityLevel(worstCo2);
    currentLevelRef.current = level;

    if (level !== lastLevelRef.current) {
      updateFavicon(level);
      lastLevelRef.current = level;
    }

    // Average reading for quality label in title
    const avgCo2 = Math.round(co2Readings.reduce((a, b) => a + b, 0) / co2Readings.length);
    const newTitle = `Hudson Air - ${getQualityLabel(avgCo2)}`;
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

  return {
    worstCo2: currentWorstCo2Ref.current,
    level: currentLevelRef.current,
  };
}
