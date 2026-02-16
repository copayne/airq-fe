import { useEffect, useRef, useCallback } from 'react';
import { useApolloClient, gql } from '@apollo/client';
import { useRealtime } from '~/context/RealtimeContext';
import type { SensorReadingEvent } from '~/lib/socketClient';
import {
  SENSOR_READING_BASIC_FRAGMENT,
  READING_MEASUREMENTS_FRAGMENT,
} from '~/graphql/fragments';

const DEBOUNCE_MS = 2000;

/**
 * Listens for `sensor_reading` WebSocket events and writes data
 * directly into the Apollo cache so the UI updates instantly.
 *
 * 1. Direct cache write — updates the matching sensor's `lastReading`
 * 2. Debounced refetch — refreshes server-computed aggregates (metrics, distribution)
 */
export function useRealtimeCacheUpdater(): void {
  const client = useApolloClient();
  const { onSensorReading } = useRealtime();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIds = useRef<Set<number>>(new Set());

  const refetchAggregates = useCallback(() => {
    void client.refetchQueries({
      include: ['GetMetrics', 'GetAirQualityDistribution'],
    });
  }, [client]);

  useEffect(() => {
    const unsubscribe = onSensorReading((event: SensorReadingEvent) => {
      // Deduplicate
      if (seenIds.current.has(event.reading_id)) return;
      seenIds.current.add(event.reading_id);
      if (seenIds.current.size > 100) {
        const entries = Array.from(seenIds.current);
        seenIds.current = new Set(entries.slice(-50));
      }

      // 1. Write the new reading into the cache as a SensorReadingObject
      const readingCacheId = `SensorReadingObject:${event.reading_id}`;

      client.cache.writeFragment({
        id: readingCacheId,
        fragment: gql`
          fragment NewReading on SensorReadingObject {
            ...SensorReadingBasic
            ...ReadingMeasurements
          }
          ${SENSOR_READING_BASIC_FRAGMENT}
          ${READING_MEASUREMENTS_FRAGMENT}
        `,
        fragmentName: 'NewReading',
        data: {
          __typename: 'SensorReadingObject',
          id: String(event.reading_id),
          readingTime: event.timestamp,
          isSuccess: true,
          co2Reading: event.co2_ppm != null
            ? { __typename: 'CO2ReadingObject', id: `co2-${event.reading_id}`, co2Ppm: event.co2_ppm }
            : null,
          temperatureReading: event.temperature_celsius != null
            ? { __typename: 'TemperatureReadingObject', id: `temp-${event.reading_id}`, temperatureCelsius: event.temperature_celsius }
            : null,
          humidityReading: event.humidity_percentage != null
            ? { __typename: 'HumidityReadingObject', id: `hum-${event.reading_id}`, humidityPercentage: event.humidity_percentage }
            : null,
        },
      });

      // 2. Point the sensor's lastReading at the new reading
      const sensorCacheId = `SensorObject:${event.sensor_id}`;
      client.cache.modify({
        id: sensorCacheId,
        fields: {
          lastReading() {
            return client.cache.writeFragment({
              fragment: gql`
                fragment LastReadingRef on SensorReadingObject {
                  ...SensorReadingBasic
                  ...ReadingMeasurements
                }
                ${SENSOR_READING_BASIC_FRAGMENT}
                ${READING_MEASUREMENTS_FRAGMENT}
              `,
              fragmentName: 'LastReadingRef',
              data: {
                __typename: 'SensorReadingObject',
                id: String(event.reading_id),
                readingTime: event.timestamp,
                isSuccess: true,
                co2Reading: event.co2_ppm != null
                  ? { __typename: 'CO2ReadingObject', id: `co2-${event.reading_id}`, co2Ppm: event.co2_ppm }
                  : null,
                temperatureReading: event.temperature_celsius != null
                  ? { __typename: 'TemperatureReadingObject', id: `temp-${event.reading_id}`, temperatureCelsius: event.temperature_celsius }
                  : null,
                humidityReading: event.humidity_percentage != null
                  ? { __typename: 'HumidityReadingObject', id: `hum-${event.reading_id}`, humidityPercentage: event.humidity_percentage }
                  : null,
              },
            });
          },
        },
      });

      // 3. Debounced refetch of aggregate queries
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(refetchAggregates, DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [client, onSensorReading, refetchAggregates]);
}
