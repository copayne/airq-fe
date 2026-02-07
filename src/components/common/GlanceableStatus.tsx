import { useGlanceableStatus } from '~/hooks/useGlanceableStatus';

/**
 * Component that provides glanceable status updates.
 * Updates browser favicon and tab title based on air quality.
 *
 * This component renders nothing - it only provides side effects.
 * Mount it once at the app level.
 */
export function GlanceableStatus(): null {
  useGlanceableStatus();
  return null;
}
