import { useRealtime } from '~/context/RealtimeContext';

/**
 * Returns a shorter poll interval when WebSocket is disconnected,
 * longer when connected (since real-time events handle freshness).
 */
export function useAdaptivePollInterval(connectedMs: number, disconnectedMs: number): number {
  const { connected } = useRealtime();
  return connected ? connectedMs : disconnectedMs;
}
