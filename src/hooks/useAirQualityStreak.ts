import { useEffect, useRef, useState, useCallback } from 'react';
import { getAirQualityLevel } from '~/utils/faviconGenerator';

interface StreakState {
  currentStreak: number; // Hours of good air quality
  longestStreak: number;
  isGood: boolean;
  celebrationTriggered: boolean;
}

const STORAGE_KEY = 'airq-streak-data';
const CELEBRATION_THRESHOLDS = [1, 4, 8, 24]; // Hours that trigger celebration

interface StoredStreakData {
  currentStreak: number;
  longestStreak: number;
  lastGoodTimestamp: number | null;
  lastCelebrationStreak: number;
}

function loadStoredData(): StoredStreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastGoodTimestamp: null, lastCelebrationStreak: 0 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StoredStreakData;
    }
  } catch {
    // Ignore parse errors
  }

  return { currentStreak: 0, longestStreak: 0, lastGoodTimestamp: null, lastCelebrationStreak: 0 };
}

function saveStoredData(data: StoredStreakData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook that tracks air quality streaks and triggers celebrations.
 * A "streak" is consecutive time with good air quality (CO2 <= 800 ppm).
 *
 * @param co2Ppm Current CO2 reading (worst across all sensors)
 * @returns Streak state and reset function
 */
export function useAirQualityStreak(co2Ppm: number | null): StreakState & { resetCelebration: () => void } {
  const [state, setState] = useState<StreakState>({
    currentStreak: 0,
    longestStreak: 0,
    isGood: false,
    celebrationTriggered: false,
  });

  const storedDataRef = useRef<StoredStreakData>(loadStoredData());

  // Update streak based on current reading
  useEffect(() => {
    if (co2Ppm === null) return;

    const level = getAirQualityLevel(co2Ppm);
    const isGood = level === 'good';
    const now = Date.now();
    const stored = storedDataRef.current;

    if (isGood) {
      // If we were already good, calculate time since last check
      if (stored.lastGoodTimestamp) {
        const hoursSinceLastGood = (now - stored.lastGoodTimestamp) / (1000 * 60 * 60);

        // If less than 15 minutes since last good reading, continue streak
        if (hoursSinceLastGood < 0.25) {
          const newStreak = stored.currentStreak + hoursSinceLastGood;
          const newLongest = Math.max(stored.longestStreak, newStreak);

          // Check if we crossed a celebration threshold
          const crossedThreshold = CELEBRATION_THRESHOLDS.find(
            threshold => newStreak >= threshold && stored.lastCelebrationStreak < threshold
          );

          const newData: StoredStreakData = {
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastGoodTimestamp: now,
            lastCelebrationStreak: crossedThreshold ?? stored.lastCelebrationStreak,
          };

          storedDataRef.current = newData;
          saveStoredData(newData);

          setState({
            currentStreak: Math.floor(newStreak),
            longestStreak: Math.floor(newLongest),
            isGood: true,
            celebrationTriggered: !!crossedThreshold,
          });

          return;
        }
      }

      // Starting a new streak
      const newData: StoredStreakData = {
        currentStreak: 0,
        longestStreak: stored.longestStreak,
        lastGoodTimestamp: now,
        lastCelebrationStreak: 0,
      };

      storedDataRef.current = newData;
      saveStoredData(newData);

      setState({
        currentStreak: 0,
        longestStreak: stored.longestStreak,
        isGood: true,
        celebrationTriggered: false,
      });
    } else {
      // Air quality is not good - reset streak
      const newData: StoredStreakData = {
        currentStreak: 0,
        longestStreak: stored.longestStreak,
        lastGoodTimestamp: null,
        lastCelebrationStreak: 0,
      };

      storedDataRef.current = newData;
      saveStoredData(newData);

      setState({
        currentStreak: 0,
        longestStreak: stored.longestStreak,
        isGood: false,
        celebrationTriggered: false,
      });
    }
  }, [co2Ppm]);

  const resetCelebration = useCallback(() => {
    setState(prev => ({ ...prev, celebrationTriggered: false }));
  }, []);

  return { ...state, resetCelebration };
}
