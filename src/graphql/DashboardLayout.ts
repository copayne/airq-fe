import { gql } from '@apollo/client';

// Fragment for dashboard layout data
export const DASHBOARD_LAYOUT_FRAGMENT = gql`
  fragment DashboardLayoutData on DashboardLayoutObject {
    id
    name
    layoutData
    isLastUsed
    createdAt
    updatedAt
  }
`;

// Get all dashboard layouts for the current user
export const GET_DASHBOARD_LAYOUTS = gql`
  query GetDashboardLayouts {
    dashboardLayouts {
      ...DashboardLayoutData
    }
  }
  ${DASHBOARD_LAYOUT_FRAGMENT}
`;

// Get the last used dashboard layout
export const GET_LAST_USED_LAYOUT = gql`
  query GetLastUsedDashboardLayout {
    lastUsedDashboardLayout {
      ...DashboardLayoutData
    }
  }
  ${DASHBOARD_LAYOUT_FRAGMENT}
`;

// Create a new dashboard layout
export const CREATE_DASHBOARD_LAYOUT = gql`
  mutation CreateDashboardLayout($input: CreateDashboardLayoutInput!) {
    createDashboardLayout(input: $input) {
      success
      message
      errors
      layout {
        ...DashboardLayoutData
      }
    }
  }
  ${DASHBOARD_LAYOUT_FRAGMENT}
`;

// Update an existing dashboard layout
export const UPDATE_DASHBOARD_LAYOUT = gql`
  mutation UpdateDashboardLayout($input: UpdateDashboardLayoutInput!) {
    updateDashboardLayout(input: $input) {
      success
      message
      errors
      layout {
        ...DashboardLayoutData
      }
    }
  }
  ${DASHBOARD_LAYOUT_FRAGMENT}
`;

// Delete a dashboard layout
export const DELETE_DASHBOARD_LAYOUT = gql`
  mutation DeleteDashboardLayout($id: ID!) {
    deleteDashboardLayout(id: $id) {
      success
      message
      errors
    }
  }
`;

// Set a layout as last used
export const SET_LAST_USED_LAYOUT = gql`
  mutation SetLastUsedLayout($id: ID!) {
    setLastUsedLayout(id: $id) {
      success
      message
      errors
      layout {
        ...DashboardLayoutData
      }
    }
  }
  ${DASHBOARD_LAYOUT_FRAGMENT}
`;

// Duplicate a dashboard layout
export const DUPLICATE_DASHBOARD_LAYOUT = gql`
  mutation DuplicateDashboardLayout($id: ID!, $newName: String!) {
    duplicateDashboardLayout(id: $id, newName: $newName) {
      success
      message
      errors
      layout {
        ...DashboardLayoutData
      }
    }
  }
  ${DASHBOARD_LAYOUT_FRAGMENT}
`;
