import { useQuery, useMutation } from '@apollo/client';
import {
  GET_DASHBOARD_LAYOUTS,
  GET_LAST_USED_LAYOUT,
  CREATE_DASHBOARD_LAYOUT,
  UPDATE_DASHBOARD_LAYOUT,
  DELETE_DASHBOARD_LAYOUT,
  SET_LAST_USED_LAYOUT,
  DUPLICATE_DASHBOARD_LAYOUT,
} from '~/graphql/DashboardLayout';
import type {
  DashboardLayout,
  DashboardLayoutData,
  DashboardLayoutMutationResponse,
} from '~/types/dashboard';

interface LayoutsQueryData {
  dashboardLayouts: DashboardLayout[];
}

interface LastUsedLayoutQueryData {
  lastUsedDashboardLayout: DashboardLayout | null;
}

interface CreateLayoutMutationData {
  createDashboardLayout: DashboardLayoutMutationResponse;
}

interface UpdateLayoutMutationData {
  updateDashboardLayout: DashboardLayoutMutationResponse;
}

interface DeleteLayoutMutationData {
  deleteDashboardLayout: DashboardLayoutMutationResponse;
}

interface SetLastUsedMutationData {
  setLastUsedLayout: DashboardLayoutMutationResponse;
}

interface DuplicateLayoutMutationData {
  duplicateDashboardLayout: DashboardLayoutMutationResponse;
}

/**
 * Hook for fetching all dashboard layouts for the current user
 */
export function useDashboardLayouts() {
  const { data, loading, error, refetch } = useQuery<LayoutsQueryData>(
    GET_DASHBOARD_LAYOUTS,
    {
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    layouts: data?.dashboardLayouts ?? [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching the last used dashboard layout
 */
export function useLastUsedLayout() {
  const { data, loading, error, refetch } = useQuery<LastUsedLayoutQueryData>(
    GET_LAST_USED_LAYOUT,
    {
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    layout: data?.lastUsedDashboardLayout ?? null,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for creating a new dashboard layout
 */
export function useCreateLayout() {
  const [createMutation, { loading, error }] = useMutation<CreateLayoutMutationData>(
    CREATE_DASHBOARD_LAYOUT,
    {
      refetchQueries: [{ query: GET_DASHBOARD_LAYOUTS }],
    }
  );

  const createLayout = async (
    name: string,
    layoutData: DashboardLayoutData
  ): Promise<DashboardLayoutMutationResponse> => {
    try {
      const result = await createMutation({
        variables: {
          input: {
            name,
            layoutData: JSON.stringify(layoutData),
          },
        },
      });
      return result.data?.createDashboardLayout ?? {
        success: false,
        message: 'No response from server',
      };
    } catch (err) {
      console.error('Create layout error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to create layout',
      };
    }
  };

  return {
    createLayout,
    loading,
    error,
  };
}

/**
 * Hook for updating an existing dashboard layout
 */
export function useUpdateLayout() {
  const [updateMutation, { loading, error }] = useMutation<UpdateLayoutMutationData>(
    UPDATE_DASHBOARD_LAYOUT,
    {
      refetchQueries: [{ query: GET_DASHBOARD_LAYOUTS }],
    }
  );

  const updateLayout = async (
    id: string,
    updates: { name?: string; layoutData?: DashboardLayoutData }
  ): Promise<DashboardLayoutMutationResponse> => {
    try {
      const result = await updateMutation({
        variables: {
          input: {
            id,
            name: updates.name,
            layoutData: updates.layoutData ? JSON.stringify(updates.layoutData) : undefined,
          },
        },
      });
      return result.data?.updateDashboardLayout ?? {
        success: false,
        message: 'No response from server',
      };
    } catch (err) {
      console.error('Update layout error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to update layout',
      };
    }
  };

  return {
    updateLayout,
    loading,
    error,
  };
}

/**
 * Hook for deleting a dashboard layout
 */
export function useDeleteLayout() {
  const [deleteMutation, { loading, error }] = useMutation<DeleteLayoutMutationData>(
    DELETE_DASHBOARD_LAYOUT,
    {
      refetchQueries: [{ query: GET_DASHBOARD_LAYOUTS }, { query: GET_LAST_USED_LAYOUT }],
    }
  );

  const deleteLayout = async (id: string): Promise<DashboardLayoutMutationResponse> => {
    try {
      const result = await deleteMutation({
        variables: { id },
      });
      return result.data?.deleteDashboardLayout ?? {
        success: false,
        message: 'No response from server',
      };
    } catch (err) {
      console.error('Delete layout error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to delete layout',
      };
    }
  };

  return {
    deleteLayout,
    loading,
    error,
  };
}

/**
 * Hook for setting a layout as last used
 */
export function useSetLastUsed() {
  const [setLastUsedMutation, { loading, error }] = useMutation<SetLastUsedMutationData>(
    SET_LAST_USED_LAYOUT,
    {
      refetchQueries: [{ query: GET_DASHBOARD_LAYOUTS }, { query: GET_LAST_USED_LAYOUT }],
    }
  );

  const setLastUsed = async (id: string): Promise<DashboardLayoutMutationResponse> => {
    try {
      const result = await setLastUsedMutation({
        variables: { id },
      });
      return result.data?.setLastUsedLayout ?? {
        success: false,
        message: 'No response from server',
      };
    } catch (err) {
      console.error('Set last used error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to set last used layout',
      };
    }
  };

  return {
    setLastUsed,
    loading,
    error,
  };
}

/**
 * Hook for duplicating a dashboard layout
 */
export function useDuplicateLayout() {
  const [duplicateMutation, { loading, error }] = useMutation<DuplicateLayoutMutationData>(
    DUPLICATE_DASHBOARD_LAYOUT,
    {
      refetchQueries: [{ query: GET_DASHBOARD_LAYOUTS }],
    }
  );

  const duplicateLayout = async (
    id: string,
    newName: string
  ): Promise<DashboardLayoutMutationResponse> => {
    try {
      const result = await duplicateMutation({
        variables: { id, newName },
      });
      return result.data?.duplicateDashboardLayout ?? {
        success: false,
        message: 'No response from server',
      };
    } catch (err) {
      console.error('Duplicate layout error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to duplicate layout',
      };
    }
  };

  return {
    duplicateLayout,
    loading,
    error,
  };
}
