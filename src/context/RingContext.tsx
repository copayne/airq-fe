/**
 * RingContext - React context for Ring device management
 *
 * Provides RingController instance and device data to components.
 * Initializes the controller on mount and manages its lifecycle.
 * Exposes token expiry state and token update functionality.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useApolloClient } from '@apollo/client';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { RingController, type RingDeviceData } from '~/services/RingController';

interface RingContextValue {
  devices: RingDeviceData[];
  isInitialized: boolean;
  error: string | null;
  tokenExpired: boolean;
  refresh: () => Promise<void>;
  syncToDatabase: () => Promise<void>;
  updateToken: (token: string) => Promise<boolean>;
}

const RingContext = createContext<RingContextValue | undefined>(undefined);

interface RingProviderProps {
  children: ReactNode;
}

export function RingProvider({ children }: RingProviderProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apolloClient = useApolloClient() as any as ApolloClient<NormalizedCacheObject>;
  const [devices, setDevices] = useState<RingDeviceData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [controller, setController] = useState<RingController | null>(null);

  useEffect(() => {
    let ringController: RingController | null = null;
    let unsubscribe: (() => void) | null = null;

    async function initializeRing() {
      try {
        console.log('[RingContext] Initializing Ring integration...');

        // Get or create controller instance
        ringController = RingController.getInstance({
          apolloClient,
        });

        // Subscribe to device updates (also fires when tokenExpired changes)
        unsubscribe = ringController.subscribe(() => {
          const updatedDevices = ringController?.getDevices() ?? [];
          setDevices(updatedDevices);
          setTokenExpired(ringController?.getTokenExpired() ?? false);
        });

        // Initialize controller (will fetch initial data and start polling)
        await ringController.initialize();

        // Get initial devices
        const initialDevices = ringController.getDevices();
        setDevices(initialDevices);
        setController(ringController);
        setIsInitialized(true);
        setError(null);
        setTokenExpired(ringController.getTokenExpired());

        console.log('[RingContext] Ring integration initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[RingContext] Failed to initialize Ring integration:', errorMessage);
        setError(errorMessage);
        setIsInitialized(false);

        if (errorMessage.includes('Refresh token is not valid') || errorMessage.includes('token expired')) {
          setTokenExpired(true);
        }

        // Still store the controller so updateToken works even when init fails
        if (ringController) {
          setController(ringController);
        }
      }
    }

    void initializeRing();

    // Cleanup on unmount — unsubscribe but don't destroy the singleton
    return () => {
      console.log('[RingContext] Cleaning up Ring integration listeners...');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [apolloClient]);

  const refresh = async () => {
    if (controller) {
      try {
        await controller.refresh();
        const updatedDevices = controller.getDevices();
        setDevices(updatedDevices);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[RingContext] Failed to refresh devices:', errorMessage);
        setError(errorMessage);
      }
    }
  };

  const syncToDatabase = async () => {
    if (controller) {
      try {
        await controller.syncToDatabase();
        const updatedDevices = controller.getDevices();
        setDevices(updatedDevices);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[RingContext] Failed to sync to database:', errorMessage);
        setError(errorMessage);
      }
    }
  };

  const updateToken = useCallback(async (token: string): Promise<boolean> => {
    if (!controller) return false;

    try {
      const success = await controller.updateToken(token);
      if (success) {
        setTokenExpired(false);
        setError(null);
        setIsInitialized(true);
        const updatedDevices = controller.getDevices();
        setDevices(updatedDevices);
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[RingContext] Failed to update token:', errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [controller]);

  const value: RingContextValue = {
    devices,
    isInitialized,
    error,
    tokenExpired,
    refresh,
    syncToDatabase,
    updateToken,
  };

  return <RingContext.Provider value={value}>{children}</RingContext.Provider>;
}

/**
 * Hook to access Ring device data and controller
 */
export function useRing(): RingContextValue {
  const context = useContext(RingContext);
  if (context === undefined) {
    throw new Error('useRing must be used within a RingProvider');
  }
  return context;
}
