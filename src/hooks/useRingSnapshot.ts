import { useQuery, useMutation } from '@apollo/client';
import { GET_LATEST_RING_SNAPSHOT, CAPTURE_RING_SNAPSHOT } from '~/graphql/RingSnapshot';
import { CACHE_AND_NETWORK_OPTIONS, DEFAULT_QUERY_OPTIONS } from '~/lib/apolloDefaults';

export interface Camera {
  id: string;
  deviceId: string;
  name: string;
  location: string | null;
}

export interface RingSnapshot {
  id: string;
  imageUrl: string;
  captureTimestamp: string;
  fileSize: number | null;
  createdAt: string;
  camera: Camera;
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
  cameraId?: number;
}

export function useRingSnapshot(cameraId?: number) {
  const { data, loading, error, refetch } = useQuery<LatestRingSnapshotData>(
    GET_LATEST_RING_SNAPSHOT,
    {
      variables: cameraId ? { cameraId } : {},
      ...CACHE_AND_NETWORK_OPTIONS,
      pollInterval: 60000, // Poll every 60 seconds
    }
  );

  const [captureMutation, { loading: capturing }] = useMutation<
    CaptureRingSnapshotData,
    CaptureRingSnapshotVariables
  >(CAPTURE_RING_SNAPSHOT, {
    errorPolicy: DEFAULT_QUERY_OPTIONS.errorPolicy,
    onCompleted: () => {
      void refetch();
    },
  });

  const captureSnapshot = async () => {
    try {
      await captureMutation({ variables: cameraId ? { cameraId } : {} });
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
