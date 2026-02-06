import type { SensorReading } from '~/types/sensors';

export type MetricType = 'co2' | 'temperature' | 'humidity';
export type TrendDirection = 'up' | 'down' | 'stable';

interface HourlyBucket {
  hour: string;
  values: number[];
}

/**
 * Extract metric value from a sensor reading
 */
function extractMetricValue(reading: SensorReading, metric: MetricType): number | null {
  switch (metric) {
    case 'co2':
      return reading.co2Reading?.co2Ppm ?? null;
    case 'temperature':
      return reading.temperatureReading?.temperatureCelsius ?? null;
    case 'humidity':
      return reading.humidityReading?.humidityPercentage ?? null;
  }
}

/**
 * Aggregate sensor readings into hourly buckets with averaged values
 * Returns an array of 24 data points (one per hour)
 */
export function aggregateHourly(
  readings: SensorReading[],
  metric: MetricType
): number[] {
  if (!readings.length) return [];

  // Group readings by hour
  const buckets = new Map<string, HourlyBucket>();

  for (const reading of readings) {
    const value = extractMetricValue(reading, metric);
    if (value === null) continue;

    // Parse reading time and get hour key
    const date = new Date(`${reading.readingTime}Z`);
    const hourKey = date.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"

    const bucket = buckets.get(hourKey);
    if (bucket) {
      bucket.values.push(value);
    } else {
      buckets.set(hourKey, { hour: hourKey, values: [value] });
    }
  }

  // Sort buckets by hour and calculate averages
  const sortedBuckets = Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, bucket]) => {
      const sum = bucket.values.reduce((acc, val) => acc + val, 0);
      return sum / bucket.values.length;
    });

  return sortedBuckets;
}

/**
 * Calculate trend direction based on data points
 * Compares the average of the first half to the second half
 */
export function calculateTrend(data: number[]): TrendDirection {
  if (data.length < 4) return 'stable';

  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  // Calculate percentage change
  const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;

  // Use 5% threshold to determine trend
  if (percentChange > 5) return 'up';
  if (percentChange < -5) return 'down';
  return 'stable';
}
