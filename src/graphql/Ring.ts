import { gql } from "@apollo/client";

export const GET_RING_DEVICES = gql`
  query GetRingDevices {
    ringDevices {
      id
      deviceId
      deviceType
      name
      location
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const BATCH_UPDATE_RING_DEVICES = gql`
  mutation BatchUpdateRingDevices($devices: [RingDeviceInput!]!) {
    batchUpdateRingDevices(devices: $devices) {
      success
      message
      devicesUpdated
      devicesCreated
    }
  }
`;
