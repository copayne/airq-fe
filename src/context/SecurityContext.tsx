import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import { useApolloClient } from '@apollo/client';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { GET_SECURITY_DEVICES, GET_SECURITY_EVENTS } from '~/graphql/Security';

interface GetSecurityDevicesData {
  securityDevices: SecurityDevice[];
}

interface GetSecurityEventsData {
  securityEvents: SecurityEvent[];
}

export interface SecurityDevice {
  id: number;
  deviceId: string;
  deviceType: string;
  name: string;
  location: string;
  provider: string;
  isActive: boolean;
  batteryLevel: number | null;
  status: string | null;
  lastStatusChange: string | null;
}

export interface SecurityEvent {
  id: number;
  deviceId: number;
  eventType: string;
  severity: string;
  message: string | null;
  createdAt: string;
}

type AlarmStatus = 'armed' | 'disarmed' | 'unknown';

interface SecurityState {
  devices: SecurityDevice[];
  events: SecurityEvent[];
  isInitialized: boolean;
  error: string | null;
  alarmStatus: AlarmStatus;
}

type SecurityAction =
  | { type: 'SET_DEVICES'; payload: SecurityDevice[] }
  | { type: 'SET_EVENTS'; payload: SecurityEvent[] }
  | { type: 'ADD_EVENT'; payload: SecurityEvent }
  | { type: 'SET_ALARM_STATUS'; payload: AlarmStatus }
  | { type: 'SET_INITIALIZED' }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: SecurityState = {
  devices: [],
  events: [],
  isInitialized: false,
  error: null,
  alarmStatus: 'unknown',
};

function securityReducer(state: SecurityState, action: SecurityAction): SecurityState {
  switch (action.type) {
    case 'SET_DEVICES':
      return { ...state, devices: action.payload };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] };
    case 'SET_ALARM_STATUS':
      return { ...state, alarmStatus: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: true };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface SecurityContextValue {
  devices: SecurityDevice[];
  events: SecurityEvent[];
  alarmStatus: AlarmStatus;
  isInitialized: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const apolloClient = useApolloClient() as ApolloClient<NormalizedCacheObject>;
  const [state, dispatch] = useReducer(securityReducer, initialState);

  const fetchDevices = useCallback(async () => {
    try {
      const { data } = await apolloClient.query<GetSecurityDevicesData>({
        query: GET_SECURITY_DEVICES,
        fetchPolicy: 'network-only',
      });
      if (data?.securityDevices) {
        dispatch({ type: 'SET_DEVICES', payload: data.securityDevices });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch security devices';
      console.error('[SecurityContext] Failed to fetch devices:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [apolloClient]);

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await apolloClient.query<GetSecurityEventsData>({
        query: GET_SECURITY_EVENTS,
        fetchPolicy: 'network-only',
      });
      if (data?.securityEvents) {
        dispatch({ type: 'SET_EVENTS', payload: data.securityEvents });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch security events';
      console.error('[SecurityContext] Failed to fetch events:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [apolloClient]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchDevices(), fetchEvents()]);
  }, [fetchDevices, fetchEvents]);

  useEffect(() => {
    async function initialize() {
      try {
        await Promise.all([fetchDevices(), fetchEvents()]);
        dispatch({ type: 'SET_INITIALIZED' });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize security';
        console.error('[SecurityContext] Initialization failed:', errorMessage);
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        dispatch({ type: 'SET_INITIALIZED' });
      }
    }

    void initialize();
  }, [fetchDevices, fetchEvents]);

  const contextValue = useMemo(
    () => ({
      devices: state.devices,
      events: state.events,
      alarmStatus: state.alarmStatus,
      isInitialized: state.isInitialized,
      error: state.error,
      refresh,
    }),
    [state.devices, state.events, state.alarmStatus, state.isInitialized, state.error, refresh],
  );

  return <SecurityContext.Provider value={contextValue}>{children}</SecurityContext.Provider>;
}

export function useSecurity(): SecurityContextValue {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
