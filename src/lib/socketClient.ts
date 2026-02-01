import { io, type Socket } from 'socket.io-client';
import { env } from '~/env.js';

export interface SensorReadingEvent {
  reading_id: number;
  sensor_id: number;
  humidity_percentage: number | null;
  temperature_celsius: number | null;
  co2_ppm: number | null;
  timestamp: string;
}

export interface AlertEvent {
  sensor_id: number;
  reading_id: number;
  co2_ppm: number;
  severity: 'warning' | 'critical';
  location: string;
}

let socket: Socket | null = null;

function getWsEndpoint(): string {
  const wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT;
  if (wsEndpoint) return wsEndpoint;

  // Derive from GraphQL endpoint: http://host:5000/graphql -> http://host:5000
  const graphqlUrl = env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  return graphqlUrl.replace(/\/graphql$/, '');
}

export function getSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket?.disconnect();

  socket = io(getWsEndpoint(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
