import { gql } from '@apollo/client';

export const ALERT_THRESHOLD_FRAGMENT = gql`
  fragment AlertThresholdData on AlertThresholdObject {
    id
    sensorId
    warningPpm
    criticalPpm
    cooldownMinutes
    isEnabled
    createdAt
    updatedAt
    sensor {
      id
      name
    }
  }
`;

export const ALERT_HISTORY_FRAGMENT = gql`
  fragment AlertHistoryData on AlertHistoryObject {
    id
    sensorId
    co2Ppm
    severity
    channelsSent
    emailStatus
    acknowledged
    acknowledgedAt
    createdAt
    sensor {
      id
      name
    }
  }
`;

export const GET_ALERT_THRESHOLDS = gql`
  query GetAlertThresholds {
    alertThresholds {
      ...AlertThresholdData
    }
  }
  ${ALERT_THRESHOLD_FRAGMENT}
`;

export const GET_ALERT_HISTORY = gql`
  query GetAlertHistory($limit: Int, $offset: Int) {
    alertHistory(limit: $limit, offset: $offset) {
      ...AlertHistoryData
    }
  }
  ${ALERT_HISTORY_FRAGMENT}
`;

export const GET_UNACKNOWLEDGED_ALERT_COUNT = gql`
  query GetUnacknowledgedAlertCount {
    unacknowledgedAlertCount
  }
`;

export const UPSERT_ALERT_THRESHOLD = gql`
  mutation UpsertAlertThreshold($input: UpsertAlertThresholdInput!) {
    upsertAlertThreshold(input: $input) {
      success
      message
      errors
      alertThreshold {
        ...AlertThresholdData
      }
    }
  }
  ${ALERT_THRESHOLD_FRAGMENT}
`;

export const DELETE_ALERT_THRESHOLD = gql`
  mutation DeleteAlertThreshold($id: ID!) {
    deleteAlertThreshold(id: $id) {
      success
      message
    }
  }
`;

export const ACKNOWLEDGE_ALERT = gql`
  mutation AcknowledgeAlert($id: ID!) {
    acknowledgeAlert(id: $id) {
      success
      message
    }
  }
`;

export const ACKNOWLEDGE_ALL_ALERTS = gql`
  mutation AcknowledgeAllAlerts {
    acknowledgeAllAlerts {
      success
      message
      count
    }
  }
`;

export const SEND_TEST_ALERT = gql`
  mutation SendTestAlert {
    sendTestAlert {
      success
      message
    }
  }
`;
