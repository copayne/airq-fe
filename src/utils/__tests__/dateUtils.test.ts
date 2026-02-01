import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  parseUTCTimestamp,
  formatShortDateTime,
  getRelativeTime,
  getMinutesAgo,
} from '../dateUtils';

describe('parseUTCTimestamp', () => {
  it('returns null for null/undefined/empty', () => {
    expect(parseUTCTimestamp(null)).toBeNull();
    expect(parseUTCTimestamp(undefined)).toBeNull();
    expect(parseUTCTimestamp('')).toBeNull();
  });

  it('parses ISO string with Z suffix', () => {
    const date = parseUTCTimestamp('2024-01-15T10:30:00Z');
    expect(date).toBeInstanceOf(Date);
    expect(date!.getUTCHours()).toBe(10);
    expect(date!.getUTCMinutes()).toBe(30);
  });

  it('appends Z to timestamps without timezone', () => {
    const date = parseUTCTimestamp('2024-01-15T10:30:00');
    expect(date).toBeInstanceOf(Date);
    expect(date!.getUTCHours()).toBe(10);
  });

  it('handles space-separated format from backends', () => {
    const date = parseUTCTimestamp('2024-01-15 10:30:00');
    expect(date).toBeInstanceOf(Date);
    expect(date!.getUTCHours()).toBe(10);
  });

  it('preserves timezone offset if present', () => {
    const date = parseUTCTimestamp('2024-01-15T10:30:00+05:00');
    expect(date).toBeInstanceOf(Date);
    expect(date!.getUTCHours()).toBe(5); // 10:30 +05:00 = 05:30 UTC
  });

  it('returns null for garbage input', () => {
    expect(parseUTCTimestamp('not-a-date')).toBeNull();
  });
});

describe('formatShortDateTime', () => {
  it('returns fallback for null input', () => {
    expect(formatShortDateTime(null)).toBe('--');
  });

  it('returns custom fallback', () => {
    expect(formatShortDateTime(null, 'N/A')).toBe('N/A');
  });

  it('formats a valid timestamp', () => {
    const result = formatShortDateTime('2024-06-15T14:30:00Z');
    // Should contain month, day, and time components
    expect(result).toBeTruthy();
    expect(result).not.toBe('--');
  });
});

describe('getRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns fallback for null', () => {
    expect(getRelativeTime(null)).toBe('Never');
    expect(getRelativeTime(null, 'N/A')).toBe('N/A');
  });

  it('returns "just now" for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(getRelativeTime(now)).toBe('just now');
  });

  it('returns minutes ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:10:00Z'));
    expect(getRelativeTime('2024-06-15T12:05:00Z')).toBe('5 mins ago');
    expect(getRelativeTime('2024-06-15T12:09:00Z')).toBe('1 min ago');
  });

  it('returns hours ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T15:00:00Z'));
    expect(getRelativeTime('2024-06-15T13:00:00Z')).toBe('2 hours ago');
    expect(getRelativeTime('2024-06-15T14:00:00Z')).toBe('1 hour ago');
  });

  it('returns days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    expect(getRelativeTime('2024-06-12T12:00:00Z')).toBe('3 days ago');
  });

  it('returns "just now" for future timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    expect(getRelativeTime('2024-06-15T13:00:00Z')).toBe('just now');
  });
});

describe('getMinutesAgo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null for null input', () => {
    expect(getMinutesAgo(null)).toBeNull();
  });

  it('returns correct minutes difference', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:30:00Z'));
    expect(getMinutesAgo('2024-06-15T12:00:00Z')).toBe(30);
  });

  it('returns 0 for timestamps at the same time', () => {
    vi.useFakeTimers();
    const now = new Date('2024-06-15T12:00:00Z');
    vi.setSystemTime(now);
    expect(getMinutesAgo('2024-06-15T12:00:00Z')).toBe(0);
  });
});
