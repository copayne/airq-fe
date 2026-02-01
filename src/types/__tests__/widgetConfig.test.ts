import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getDefaultWidgetConfig,
  getDateRangeFromPreset,
  DEFAULT_CHART_CONFIG,
  DEFAULT_MULTI_METRIC_CONFIG,
  DEFAULT_TABLE_CONFIG,
  DEFAULT_RING_SNAPSHOT_CONFIG,
  DEFAULT_QUICK_ACTIONS_CONFIG,
} from '../widgetConfig';

describe('getDefaultWidgetConfig', () => {
  const widgetTypeToDefault: [string, object][] = [
    ['TEMPERATURE_CHART', DEFAULT_CHART_CONFIG],
    ['CO2_CHART', DEFAULT_CHART_CONFIG],
    ['HUMIDITY_CHART', DEFAULT_CHART_CONFIG],
    ['MULTI_METRIC_CHART', DEFAULT_MULTI_METRIC_CONFIG],
    ['TABLE', DEFAULT_TABLE_CONFIG],
    ['RING_SNAPSHOT', DEFAULT_RING_SNAPSHOT_CONFIG],
    ['QUICK_ACTIONS', DEFAULT_QUICK_ACTIONS_CONFIG],
  ];

  it.each(widgetTypeToDefault)('%s returns correct defaults', (widgetType, expectedConfig) => {
    const result = getDefaultWidgetConfig(widgetType);
    expect(result).toEqual(expectedConfig);
  });

  it('returns a shallow copy, not the same reference', () => {
    const a = getDefaultWidgetConfig('TABLE');
    const b = getDefaultWidgetConfig('TABLE');
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });

  it('returns empty object for unknown widget type', () => {
    expect(getDefaultWidgetConfig('UNKNOWN_WIDGET')).toEqual({});
  });
});

describe('getDateRangeFromPreset', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null for "custom"', () => {
    expect(getDateRangeFromPreset('custom')).toBeNull();
  });

  it('returns null for "all"', () => {
    expect(getDateRangeFromPreset('all')).toBeNull();
  });

  it('returns correct range for "1h"', () => {
    vi.useFakeTimers();
    const now = new Date('2024-06-15T12:00:00Z');
    vi.setSystemTime(now);

    const result = getDateRangeFromPreset('1h');
    expect(result).not.toBeNull();
    const diffMs = result!.endDate.getTime() - result!.startDate.getTime();
    expect(diffMs).toBe(60 * 60 * 1000);
  });

  it('returns correct range for "24h"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = getDateRangeFromPreset('24h');
    expect(result).not.toBeNull();
    const diffMs = result!.endDate.getTime() - result!.startDate.getTime();
    expect(diffMs).toBe(24 * 60 * 60 * 1000);
  });

  it('returns correct range for "7d"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = getDateRangeFromPreset('7d');
    expect(result).not.toBeNull();
    const diffMs = result!.endDate.getTime() - result!.startDate.getTime();
    expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('returns correct range for "90d"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = getDateRangeFromPreset('90d');
    expect(result).not.toBeNull();
    const diffMs = result!.endDate.getTime() - result!.startDate.getTime();
    expect(diffMs).toBe(90 * 24 * 60 * 60 * 1000);
  });

  it('endDate is approximately now', () => {
    vi.useFakeTimers();
    const now = new Date('2024-06-15T12:00:00Z');
    vi.setSystemTime(now);

    const result = getDateRangeFromPreset('1h');
    expect(result!.endDate.getTime()).toBe(now.getTime());
  });
});
