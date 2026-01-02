/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { useQuery, type ApolloError } from "@apollo/client";
import { GET_RING_DEVICES } from "~/graphql/Ring";
import type { GetRingDevicesData, RingDevice } from "~/types/sensors";

interface UseRingDevicesOptions {
  pollInterval?: number;
  fetchPolicy?: "cache-first" | "network-only" | "cache-and-network";
}

interface UseRingDevicesResult {
  devices: RingDevice[];
  loading: boolean;
  error: ApolloError | undefined;
  refetch: () => void;
}

export function useRingDevices(
  options: UseRingDevicesOptions = {}
): UseRingDevicesResult {
  const {
    pollInterval = 15000, // 15 seconds - frontend refresh
    fetchPolicy = "cache-and-network",
  } = options;

  const { data, loading, error, refetch } = useQuery<GetRingDevicesData>(
    GET_RING_DEVICES,
    {
      pollInterval,
      fetchPolicy,
      notifyOnNetworkStatusChange: true,
    }
  );

  return {
    devices: data?.ringDevices ?? [],
    loading,
    error,
    refetch: () => void refetch(),
  };
}
