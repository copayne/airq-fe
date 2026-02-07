import { useGlanceableStatus } from '~/hooks/useGlanceableStatus';
import { useHapticFeedback } from '~/hooks/useHapticFeedback';
import { useAirQualityStreak } from '~/hooks/useAirQualityStreak';
import Confetti from './Confetti';

/**
 * Component that provides glanceable status updates and micro-interactions.
 * - Updates browser favicon and tab title based on air quality
 * - Provides haptic feedback on mobile when thresholds are crossed
 * - Shows confetti celebration when good air quality streaks are achieved
 *
 * This component renders only the confetti overlay when active.
 * Mount it once at the app level.
 */
export function GlanceableStatus(): JSX.Element | null {
  const { worstCo2 } = useGlanceableStatus();

  // Haptic feedback on threshold crossings
  useHapticFeedback(worstCo2);

  // Track good air quality streaks
  const { celebrationTriggered, resetCelebration } = useAirQualityStreak(worstCo2);

  return (
    <Confetti
      active={celebrationTriggered}
      onComplete={resetCelebration}
      duration={3000}
      particleCount={60}
    />
  );
}
