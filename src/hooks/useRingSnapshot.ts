import { useQuery, useMutation } from '@apollo/client';
import { GET_LATEST_RING_SNAPSHOT, CAPTURE_RING_SNAPSHOT } from '~/graphql/RingSnapshot';

export interface RingSnapshot {
  id: string;
  deviceId: string;
  deviceName: string | null;
  imageUrl: string;
  captureTimestamp: string;
  fileSize: number | null;
  createdAt: string;
}

interface LatestRingSnapshotData {
  latestRingSnapshot: RingSnapshot | null;
}

interface CaptureRingSnapshotData {
  captureRingSnapshot: {
    success: boolean;
    message: string;
    snapshot: RingSnapshot | null;
  };
}

interface CaptureRingSnapshotVariables {
  deviceId?: string;
}

export function useRingSnapshot(deviceId?: string) {
  const { data, loading, error, refetch } = useQuery<LatestRingSnapshotData>(
    GET_LATEST_RING_SNAPSHOT,
    {
      variables: deviceId ? { deviceId } : {},
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-and-network',
      pollInterval: 60000, // Poll every 60 seconds
    }
  );

  const [captureMutation, { loading: capturing }] = useMutation<
    CaptureRingSnapshotData,
    CaptureRingSnapshotVariables
  >(CAPTURE_RING_SNAPSHOT, {
    errorPolicy: 'all',
    onCompleted: () => {
      void refetch();
    },
  });

  const captureSnapshot = async () => {
    try {
      await captureMutation({ variables: deviceId ? { deviceId } : {} });
    } catch (err) {
      console.error('Error capturing snapshot:', err);
    }
  };

  return {
    snapshot: data?.latestRingSnapshot ?? null,
    loading,
    error,
    capturing,
    captureSnapshot,
    refetch,
  };
}
