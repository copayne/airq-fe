import { gql } from '@apollo/client';

export const GET_LATEST_RING_SNAPSHOT = gql`
  query GetLatestRingSnapshot($deviceId: String) {
    latestRingSnapshot(deviceId: $deviceId) {
      id
      deviceId
      deviceName
      imageUrl
      captureTimestamp
      fileSize
      createdAt
    }
  }
`;

export const GET_RING_SNAPSHOTS = gql`
  query GetRingSnapshots($deviceId: String, $limit: Int) {
    ringSnapshots(deviceId: $deviceId, limit: $limit) {
      id
      deviceId
      deviceName
      imageUrl
      captureTimestamp
      fileSize
      createdAt
    }
  }
`;

export const CAPTURE_RING_SNAPSHOT = gql`
  mutation CaptureRingSnapshot($deviceId: String) {
    captureRingSnapshot(deviceId: $deviceId) {
      success
      message
      snapshot {
        id
        deviceId
        deviceName
        imageUrl
        captureTimestamp
        fileSize
        createdAt
      }
    }
  }
`;
