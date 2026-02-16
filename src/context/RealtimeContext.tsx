import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket, type SensorReadingEvent, type AlertEvent, type SensorHealthEvent } from '~/lib/socketClient';
import { useAuth } from './AuthContext';

interface RealtimeContextValue {
  connected: boolean;
  onSensorReading: (handler: (data: SensorReadingEvent) => void) => () => void;
  onAlert: (handler: (data: AlertEvent) => void) => () => void;
  onSensorHealth: (handler: (data: SensorHealthEvent) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onSensorReading: () => () => { /* noop */ },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onAlert: () => () => { /* noop */ },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onSensorHealth: () => () => { /* noop */ },
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const sock = getSocket(token);
    socketRef.current = sock;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    sock.on('connect', onConnect);
    sock.on('disconnect', onDisconnect);

    if (sock.connected) setConnected(true);

    return () => {
      sock.off('connect', onConnect);
      sock.off('disconnect', onDisconnect);
    };
  }, [isAuthenticated, token]);

  const onSensorReading = useCallback((handler: (data: SensorReadingEvent) => void) => {
    const sock = socketRef.current;
    if (!sock) return () => { /* noop */ };
    sock.on('sensor_reading', handler);
    return () => { sock.off('sensor_reading', handler); };
  }, []);

  const onAlert = useCallback((handler: (data: AlertEvent) => void) => {
    const sock = socketRef.current;
    if (!sock) return () => { /* noop */ };
    sock.on('alert', handler);
    return () => { sock.off('alert', handler); };
  }, []);

  const onSensorHealth = useCallback((handler: (data: SensorHealthEvent) => void) => {
    const sock = socketRef.current;
    if (!sock) return () => { /* noop */ };
    sock.on('sensor_health', handler);
    return () => { sock.off('sensor_health', handler); };
  }, []);

  return (
    <RealtimeContext.Provider value={{ connected, onSensorReading, onAlert, onSensorHealth }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue {
  return useContext(RealtimeContext);
}
