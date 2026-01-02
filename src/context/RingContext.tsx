/**
 * RingContext - React context for Ring device management
 *
 * Provides RingController instance and device data to components.
 * Initializes the controller on mount and manages its lifecycle.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useApolloClient } from '@apollo/client';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { RingController, type RingDeviceData } from '~/services/RingController';

interface RingContextValue {
  devices: RingDeviceData[];
  isInitialized: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  syncToDatabase: () => Promise<void>;
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

        // Subscribe to device updates
        unsubscribe = ringController.subscribe(() => {
          const updatedDevices = ringController?.getDevices() ?? [];
          setDevices(updatedDevices);
        });

        // Initialize controller (will fetch initial data and start polling)
        await ringController.initialize();

        // Get initial devices
        const initialDevices = ringController.getDevices();
        setDevices(initialDevices);
        setController(ringController);
        setIsInitialized(true);
        setError(null);

        console.log('[RingContext] Ring integration initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[RingContext] Failed to initialize Ring integration:', errorMessage);
        setError(errorMessage);
        setIsInitialized(false);
      }
    }

    void initializeRing();

    // Cleanup on unmount
    return () => {
      console.log('[RingContext] Cleaning up Ring integration...');
      if (unsubscribe) {
        unsubscribe();
      }
      if (ringController) {
        ringController.destroy();
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

  const value: RingContextValue = {
    devices,
    isInitialized,
    error,
    refresh,
    syncToDatabase,
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
