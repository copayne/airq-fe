'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import {
  useDashboardLayouts,
  useCreateLayout,
  useUpdateLayout,
  useDeleteLayout,
  useDuplicateLayout,
} from '~/hooks/useDashboardLayouts';
import { useToast } from '~/components/common/Toast';
import { useAuth } from '~/context/AuthContext';
import type {
  DashboardLayout,
  DashboardLayoutData,
  WidgetState,
} from '~/types/dashboard';
import { getWidgetDefinition, type WidgetDefinition } from '~/config/widgetRegistry';
import { getDefaultWidgetConfig } from '~/types/widgetConfig';

// localStorage key for device-specific last used layout
const LAST_USED_LAYOUT_KEY = 'airq-last-used-layout-id';

/**
 * Get last used layout ID from localStorage (device-specific)
 */
function getLocalLastUsedLayoutId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LAST_USED_LAYOUT_KEY);
  } catch {
    return null;
  }
}

/**
 * Save last used layout ID to localStorage (device-specific)
 */
function setLocalLastUsedLayoutId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_USED_LAYOUT_KEY, id);
  } catch {
    console.error('Failed to save last used layout to localStorage');
  }
}

/**
 * Parse layout data that may be double-encoded (JSON string of JSON string)
 */
function parseLayoutData(data: string): DashboardLayoutData {
  let parsed: unknown = JSON.parse(data) as unknown;
  // If the result is still a string, parse again (double-encoded)
  while (typeof parsed === 'string') {
    parsed = JSON.parse(parsed) as unknown;
  }
  return parsed as DashboardLayoutData;
}

interface DashboardLayoutContextValue {
  // State
  layouts: DashboardLayout[];
  currentLayoutId: string | null;
  currentLayout: DashboardLayout | null;
  currentLayoutData: DashboardLayoutData | null;
  isLoading: boolean;
  isSaving: boolean;

  // Widget drag state (for external drag from widget menu)
  droppingWidget: WidgetDefinition | null;
  setDroppingWidget: (widget: WidgetDefinition | null) => void;

  // Actions
  loadLayout: (id: string) => Promise<void>;
  createNewLayout: (name: string) => Promise<boolean>;
  renameLayout: (id: string, newName: string) => Promise<boolean>;
  deleteLayout: (id: string) => Promise<boolean>;
  duplicateLayout: (id: string, newName: string) => Promise<boolean>;

  // Layout data update (called by canvas when user drags/resizes)
  updateLayoutData: (data: DashboardLayoutData) => void;

  // Add widget to dashboard
  addWidget: (widgetType: string) => void;

  // Update widget configuration
  updateWidgetConfig: (widgetId: string, config: Record<string, unknown>) => void;
}

interface DashboardLayoutState {
  layouts: DashboardLayout[];
  currentLayoutId: string | null;
  currentLayoutData: DashboardLayoutData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

type DashboardLayoutAction =
  | { type: 'SET_LAYOUTS'; payload: DashboardLayout[] }
  | { type: 'SET_CURRENT_LAYOUT'; payload: { id: string; data: DashboardLayoutData } }
  | { type: 'UPDATE_LAYOUT_DATA'; payload: DashboardLayoutData }
  | { type: 'UPDATE_WIDGET_CONFIG'; payload: { widgetId: string; config: Record<string, unknown> } }
  | { type: 'CLEAR_CURRENT_LAYOUT' }
  | { type: 'UPDATE_LAYOUT_IN_LIST'; payload: DashboardLayout }
  | { type: 'REMOVE_LAYOUT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const DashboardLayoutContext = createContext<DashboardLayoutContextValue | undefined>(
  undefined
);

const initialState: DashboardLayoutState = {
  layouts: [],
  currentLayoutId: null,
  currentLayoutData: null,
  isLoading: true,
  isSaving: false,
  error: null,
};

function layoutReducer(
  state: DashboardLayoutState,
  action: DashboardLayoutAction
): DashboardLayoutState {
  switch (action.type) {
    case 'SET_LAYOUTS':
      return { ...state, layouts: action.payload };
    case 'SET_CURRENT_LAYOUT':
      return {
        ...state,
        currentLayoutId: action.payload.id,
        currentLayoutData: action.payload.data,
      };
    case 'UPDATE_LAYOUT_DATA':
      return { ...state, currentLayoutData: action.payload };
    case 'UPDATE_WIDGET_CONFIG': {
      if (!state.currentLayoutData) return state;
      const { widgetId, config } = action.payload;
      return {
        ...state,
        currentLayoutData: {
          ...state.currentLayoutData,
          widgets: state.currentLayoutData.widgets.map((ws: WidgetState) => {
            if (ws.instanceId !== widgetId) return ws;
            return { ...ws, config: { ...ws.config, ...config } };
          }),
        },
      };
    }
    case 'CLEAR_CURRENT_LAYOUT':
      return { ...state, currentLayoutId: null, currentLayoutData: null };
    case 'UPDATE_LAYOUT_IN_LIST':
      return {
        ...state,
        layouts: state.layouts.map((l) =>
          l.id === action.payload.id ? action.payload : l
        ),
      };
    case 'REMOVE_LAYOUT':
      return {
        ...state,
        layouts: state.layouts.filter((l) => l.id !== action.payload),
        currentLayoutId:
          state.currentLayoutId === action.payload ? null : state.currentLayoutId,
        currentLayoutData:
          state.currentLayoutId === action.payload ? null : state.currentLayoutData,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface DashboardLayoutProviderProps {
  children: ReactNode;
}

/**
 * Generate a unique instance ID for a new widget
 */
function generateInstanceId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function DashboardLayoutProvider({ children }: DashboardLayoutProviderProps) {
  const [state, dispatch] = useReducer(layoutReducer, initialState);
  const [droppingWidget, setDroppingWidget] = useState<WidgetDefinition | null>(null);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  // Hooks for API operations
  const { layouts: fetchedLayouts, loading: layoutsLoading, refetch } = useDashboardLayouts();
  const { createLayout: createLayoutMutation, loading: createLoading } = useCreateLayout();
  const { updateLayout: updateLayoutMutation, loading: updateLoading } = useUpdateLayout();
  const { deleteLayout: deleteLayoutMutation, loading: deleteLoading } = useDeleteLayout();
  const { duplicateLayout: duplicateLayoutMutation, loading: duplicateLoading } = useDuplicateLayout();

  // Sync fetched layouts to state
  useEffect(() => {
    if (!layoutsLoading) {
      dispatch({ type: 'SET_LAYOUTS', payload: fetchedLayouts });
    }
  }, [fetchedLayouts, layoutsLoading]);

  // Set loading state
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: layoutsLoading });
  }, [layoutsLoading]);

  // Load last used layout from localStorage on initial mount (device-specific)
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (
      !initialLoadDone.current &&
      !layoutsLoading &&
      fetchedLayouts.length > 0 &&
      isAuthenticated
    ) {
      initialLoadDone.current = true;

      // Get last used layout ID from localStorage (device-specific)
      const localLastUsedId = getLocalLastUsedLayoutId();

      if (localLastUsedId) {
        // Try to find and load the layout from localStorage ID
        const layout = fetchedLayouts.find((l) => l.id === localLastUsedId);
        if (layout) {
          try {
            const layoutData = parseLayoutData(layout.layoutData);
            dispatch({
              type: 'SET_CURRENT_LAYOUT',
              payload: { id: layout.id, data: layoutData },
            });
          } catch (e) {
            console.error('Failed to parse last used layout:', e);
          }
        }
      }
    }
  }, [fetchedLayouts, layoutsLoading, isAuthenticated]);

  // Auto-save: debounce layout data changes and persist silently.
  // Skip the initial load (when layout is first set from server) by tracking
  // whether the user has made any local edits since the layout was loaded.
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedSnapshotRef = useRef<string | null>(null);

  // Capture the server snapshot whenever a layout is loaded so we can
  // distinguish "loaded from server" from "user edited".
  useEffect(() => {
    if (state.currentLayoutData && state.currentLayoutId) {
      // Only set the snapshot once per layout load — not on every data change.
      // We detect a fresh load when the ID changes.
      loadedSnapshotRef.current = JSON.stringify(state.currentLayoutData);
    } else {
      loadedSnapshotRef.current = null;
    }
    // Intentionally only react to ID changes (not data changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentLayoutId]);

  useEffect(() => {
    if (!state.currentLayoutId || !state.currentLayoutData) return;

    // Skip if data matches the snapshot taken at load time (no user edits).
    const currentJson = JSON.stringify(state.currentLayoutData);
    if (currentJson === loadedSnapshotRef.current) return;

    // Don't queue auto-save while a manual save is in progress.
    if (state.isSaving) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    const layoutId = state.currentLayoutId;
    const layoutData = state.currentLayoutData;

    autoSaveTimer.current = setTimeout(() => {
      void (async () => {
        try {
          await updateLayoutMutation(layoutId, { layoutData });
          // Silently refetch so the layout list stays in sync.
          await refetch();
        } catch {
          // Auto-save failures are silent — user can still manually save.
          console.error('Auto-save failed');
        }
      })();
    }, 2000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentLayoutData, state.currentLayoutId]);

  // Get current layout from state
  const currentLayout = useMemo(() => {
    if (!state.currentLayoutId) return null;
    return state.layouts.find((l) => l.id === state.currentLayoutId) ?? null;
  }, [state.currentLayoutId, state.layouts]);

  // Load a layout by ID
  const loadLayout = useCallback(
    async (id: string) => {
      const layout = state.layouts.find((l) => l.id === id);
      if (!layout) {
        showToast('error', 'Layout not found');
        return;
      }

      try {
        const layoutData = parseLayoutData(layout.layoutData);
        dispatch({
          type: 'SET_CURRENT_LAYOUT',
          payload: { id, data: layoutData },
        });

        // Save as last used to localStorage (device-specific)
        setLocalLastUsedLayoutId(id);
        showToast('success', `Loaded "${layout.name}"`);
      } catch (e) {
        console.error('Failed to load layout:', e);
        showToast('error', 'Failed to load layout');
      }
    },
    [state.layouts, showToast]
  );

  // Update layout data in memory (called by canvas on drag/resize)
  const updateLayoutData = useCallback((data: DashboardLayoutData) => {
    dispatch({ type: 'UPDATE_LAYOUT_DATA', payload: data });
  }, []);

  // Add a new widget to the dashboard
  const addWidget = useCallback(
    (widgetType: string) => {
      const widgetDef = getWidgetDefinition(widgetType);
      if (!widgetDef) {
        showToast('error', `Unknown widget type: ${widgetType}`);
        return;
      }

      // Create initial layout data if none exists
      const baseLayoutData: DashboardLayoutData = state.currentLayoutData ?? {
        version: 1,
        widgets: [],
      };

      const instanceId = generateInstanceId();

      // Get layouts with MINIMUM dimensions so new widgets don't disrupt existing layout
      const lgLayout = widgetDef.defaultLayouts.lg;
      const mdLayout = widgetDef.defaultLayouts.md;
      const smLayout = widgetDef.defaultLayouts.sm;

      // Get default config for this widget type
      const defaultConfig = getDefaultWidgetConfig(widgetType);

      // Create the new widget with MINIMUM dimensions
      // Position at y: Infinity so react-grid-layout places it at the bottom
      const newWidget: WidgetState = {
        instanceId,
        type: widgetType,
        config: Object.keys(defaultConfig).length > 0 ? defaultConfig : undefined,
        layout: {
          lg: {
            i: instanceId,
            x: 0,
            y: Infinity,
            w: lgLayout.minW ?? lgLayout.w,
            h: lgLayout.minH ?? lgLayout.h,
            minW: lgLayout.minW,
            minH: lgLayout.minH,
            maxW: lgLayout.maxW,
            maxH: lgLayout.maxH,
          },
          md: {
            i: instanceId,
            x: 0,
            y: Infinity,
            w: mdLayout.minW ?? mdLayout.w,
            h: mdLayout.minH ?? mdLayout.h,
            minW: mdLayout.minW,
            minH: mdLayout.minH,
            maxW: mdLayout.maxW,
            maxH: mdLayout.maxH,
          },
          sm: {
            i: instanceId,
            x: 0,
            y: Infinity,
            w: smLayout.minW ?? smLayout.w,
            h: smLayout.minH ?? smLayout.h,
            minW: smLayout.minW,
            minH: smLayout.minH,
            maxW: smLayout.maxW,
            maxH: smLayout.maxH,
          },
        },
      };

      const newLayoutData: DashboardLayoutData = {
        ...baseLayoutData,
        widgets: [...baseLayoutData.widgets, newWidget],
      };

      dispatch({ type: 'UPDATE_LAYOUT_DATA', payload: newLayoutData });
      showToast('success', `Added ${widgetDef.name}`);
    },
    [state.currentLayoutData, showToast]
  );

  // Update widget configuration
  // Uses a dedicated reducer action to avoid stale closure issues -
  // the reducer always has the latest state, so configs from other widgets
  // are never accidentally overwritten.
  const updateWidgetConfig = useCallback(
    (widgetId: string, config: Record<string, unknown>) => {
      dispatch({ type: 'UPDATE_WIDGET_CONFIG', payload: { widgetId, config } });
    },
    []
  );

  // Create a new blank layout and switch to it
  const createNewLayout = useCallback(
    async (name: string): Promise<boolean> => {
      const blankData: DashboardLayoutData = { version: 1, widgets: [] };

      dispatch({ type: 'SET_SAVING', payload: true });

      const result = await createLayoutMutation(name, blankData);

      dispatch({ type: 'SET_SAVING', payload: false });

      if (result.success && result.layout) {
        try {
          const layoutData = parseLayoutData(result.layout.layoutData);
          dispatch({
            type: 'SET_CURRENT_LAYOUT',
            payload: { id: result.layout.id, data: layoutData },
          });
          setLocalLastUsedLayoutId(result.layout.id);
        } catch {
          // Fallback: set the blank data directly
          dispatch({
            type: 'SET_CURRENT_LAYOUT',
            payload: { id: result.layout.id, data: blankData },
          });
          setLocalLastUsedLayoutId(result.layout.id);
        }
        showToast('success', `Created "${name}"`);
        await refetch();
        return true;
      } else {
        showToast('error', result.errors?.[0] ?? result.message ?? 'Failed to create layout');
        return false;
      }
    },
    [createLayoutMutation, refetch, showToast]
  );

  // Rename a layout
  const renameLayout = useCallback(
    async (id: string, newName: string): Promise<boolean> => {
      dispatch({ type: 'SET_SAVING', payload: true });

      const result = await updateLayoutMutation(id, { name: newName });

      dispatch({ type: 'SET_SAVING', payload: false });

      if (result.success) {
        showToast('success', 'Layout renamed successfully');
        await refetch();
        return true;
      } else {
        showToast('error', result.errors?.[0] ?? result.message ?? 'Failed to rename layout');
        return false;
      }
    },
    [updateLayoutMutation, refetch, showToast]
  );

  // Delete a layout
  const deleteLayout = useCallback(
    async (id: string): Promise<boolean> => {
      const layout = state.layouts.find((l) => l.id === id);

      const result = await deleteLayoutMutation(id);

      if (result.success) {
        dispatch({ type: 'REMOVE_LAYOUT', payload: id });
        showToast('success', `Deleted "${layout?.name ?? 'layout'}"`);
        await refetch();
        return true;
      } else {
        showToast('error', result.errors?.[0] ?? result.message ?? 'Failed to delete layout');
        return false;
      }
    },
    [state.layouts, deleteLayoutMutation, refetch, showToast]
  );

  // Duplicate a layout
  const duplicateLayout = useCallback(
    async (id: string, newName: string): Promise<boolean> => {
      dispatch({ type: 'SET_SAVING', payload: true });

      const result = await duplicateLayoutMutation(id, newName);

      dispatch({ type: 'SET_SAVING', payload: false });

      if (result.success) {
        showToast('success', 'Layout duplicated successfully');
        await refetch();
        return true;
      } else {
        showToast('error', result.errors?.[0] ?? result.message ?? 'Failed to duplicate layout');
        return false;
      }
    },
    [duplicateLayoutMutation, refetch, showToast]
  );

  const value = useMemo<DashboardLayoutContextValue>(
    () => ({
      layouts: state.layouts,
      currentLayoutId: state.currentLayoutId,
      currentLayout,
      currentLayoutData: state.currentLayoutData,
      isLoading: state.isLoading,
      isSaving: state.isSaving || createLoading || updateLoading || deleteLoading || duplicateLoading,
      droppingWidget,
      setDroppingWidget,
      loadLayout,
      createNewLayout,
      renameLayout,
      deleteLayout,
      duplicateLayout,
      updateLayoutData,
      addWidget,
      updateWidgetConfig,
    }),
    [
      state.layouts,
      state.currentLayoutId,
      state.currentLayoutData,
      state.isLoading,
      state.isSaving,
      currentLayout,
      createLoading,
      updateLoading,
      deleteLoading,
      duplicateLoading,
      droppingWidget,
      loadLayout,
      createNewLayout,
      renameLayout,
      deleteLayout,
      duplicateLayout,
      updateLayoutData,
      addWidget,
      updateWidgetConfig,
    ]
  );

  return (
    <DashboardLayoutContext.Provider value={value}>
      {children}
    </DashboardLayoutContext.Provider>
  );
}

export function useDashboardLayoutContext(): DashboardLayoutContextValue {
  const context = useContext(DashboardLayoutContext);
  if (!context) {
    throw new Error(
      'useDashboardLayoutContext must be used within a DashboardLayoutProvider'
    );
  }
  return context;
}

export { DashboardLayoutContext };
