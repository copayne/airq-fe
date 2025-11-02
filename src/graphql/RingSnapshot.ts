import { gql } from '@apollo/client';

export const GET_LATEST_RING_SNAPSHOT = gql`
  query GetLatestRingSnapshot($cameraId: Int) {
    latestRingSnapshot(cameraId: $cameraId) {
      id
      imageUrl
      captureTimestamp
      fileSize
      createdAt
      camera {
        id
        deviceId
        name
        location
      }
    }
  }
`;

export const GET_RING_SNAPSHOTS = gql`
  query GetRingSnapshots($cameraId: Int, $limit: Int) {
    ringSnapshots(cameraId: $cameraId, limit: $limit) {
      id
      imageUrl
      captureTimestamp
      fileSize
      createdAt
      camera {
        id
        deviceId
        name
        location
      }
    }
  }
`;

export const CAPTURE_RING_SNAPSHOT = gql`
  mutation CaptureRingSnapshot($cameraId: Int) {
    captureRingSnapshot(cameraId: $cameraId) {
      success
      message
      snapshot {
        id
        imageUrl
        captureTimestamp
        fileSize
        createdAt
        camera {
          id
          deviceId
          name
          location
        }
      }
    }
  }
`;

export const GET_CAMERAS = gql`
  query GetCameras {
    cameras {
      id
      deviceId
      name
      location
      model
      isActive
      latestSnapshot {
        id
        captureTimestamp
        imageUrl
      }
    }
  }
`;
