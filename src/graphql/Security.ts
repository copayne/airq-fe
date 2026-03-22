import { gql } from '@apollo/client';

export const GET_SECURITY_DEVICES = gql`
  query GetSecurityDevices {
    securityDevices {
      id
      deviceId
      deviceType
      name
      location
      provider
      isActive
      batteryLevel
      status
      lastStatusChange
    }
  }
`;

export const GET_SECURITY_EVENTS = gql`
  query GetSecurityEvents($filter: SecurityEventFilterInput) {
    securityEvents(filter: $filter) {
      id
      deviceId
      eventType
      severity
      message
      createdAt
    }
  }
`;

export const UPDATE_SECURITY_DEVICE = gql`
  mutation UpdateSecurityDevice($input: SecurityDeviceInput!) {
    updateSecurityDevice(input: $input) {
      success
      message
      device {
        id
        deviceId
        deviceType
        name
        status
        batteryLevel
      }
    }
  }
`;
