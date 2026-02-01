import { useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { useRealtime } from '~/context/RealtimeContext';

/**
 * Listens for real-time sensor_reading WebSocket events and
 * refetches active sensor-related Apollo queries so the cache stays fresh.
 */
export function useRealtimeReadings(): void {
  const client = useApolloClient();
  const { onSensorReading } = useRealtime();

  useEffect(() => {
    const unsubscribe = onSensorReading(() => {
      void client.refetchQueries({
        include: ['GetSensors', 'GetFilteredSensorReadings', 'GetSensorReadings'],
      });
    });

    return unsubscribe;
  }, [client, onSensorReading]);
}
