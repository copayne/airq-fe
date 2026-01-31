/**
 * Date/time utilities for consistent timezone handling.
 *
 * All timestamps from the backend are in UTC. This module ensures
 * they are correctly parsed and displayed in the user's local timezone.
 */

/**
 * Parses a UTC timestamp string and returns a Date object.
 * Handles various formats from the backend.
 *
 * @param timestamp - ISO 8601 timestamp string (with or without Z suffix)
 * @returns Date object representing the UTC time
 */
export function parseUTCTimestamp(timestamp: string | null | undefined): Date | null {
  if (!timestamp) return null;

  try {
    // If timestamp doesn't end with Z or timezone offset, append Z to indicate UTC
    let normalizedTimestamp = timestamp;
    if (!timestamp.endsWith('Z') && !timestamp.match(/[+-]\d{2}:\d{2}$/)) {
      // Replace space with T if present (some backends use space instead of T)
      normalizedTimestamp = timestamp.replace(' ', 'T') + 'Z';
    }

    const date = new Date(normalizedTimestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

/**
 * Formats a UTC timestamp for display in the user's local timezone.
 *
 * @param timestamp - ISO 8601 timestamp string
 * @param fallback - String to return if timestamp is invalid (default: '--')
 * @returns Formatted date/time string in local timezone
 */
export function formatDateTime(timestamp: string | null | undefined, fallback = '--'): string {
  const date = parseUTCTimestamp(timestamp);
  if (!date) return fallback;

  return date.toLocaleString();
}

/**
 * Formats a UTC timestamp as a short date/time.
 *
 * @param timestamp - ISO 8601 timestamp string
 * @param fallback - String to return if timestamp is invalid (default: '--')
 * @returns Formatted short date/time string
 */
export function formatShortDateTime(timestamp: string | null | undefined, fallback = '--'): string {
  const date = parseUTCTimestamp(timestamp);
  if (!date) return fallback;

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a UTC timestamp as just the time.
 *
 * @param timestamp - ISO 8601 timestamp string
 * @param fallback - String to return if timestamp is invalid (default: '--')
 * @returns Formatted time string
 */
export function formatTime(timestamp: string | null | undefined, fallback = '--'): string {
  const date = parseUTCTimestamp(timestamp);
  if (!date) return fallback;

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Gets a relative time string (e.g., "5 minutes ago", "2 hours ago").
 *
 * @param timestamp - ISO 8601 timestamp string
 * @param fallback - String to return if timestamp is invalid (default: 'Never')
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: string | null | undefined, fallback = 'Never'): string {
  const date = parseUTCTimestamp(timestamp);
  if (!date) return fallback;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 0) {
    return 'just now'; // Future timestamp, treat as now
  }

  if (diffSec < 60) {
    return 'just now';
  }

  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }

  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }

  // For older dates, just show the date
  return date.toLocaleDateString();
}

/**
 * Gets time difference in minutes between a timestamp and now.
 *
 * @param timestamp - ISO 8601 timestamp string
 * @returns Number of minutes difference, or null if invalid
 */
export function getMinutesAgo(timestamp: string | null | undefined): number | null {
  const date = parseUTCTimestamp(timestamp);
  if (!date) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / 60000);
}
