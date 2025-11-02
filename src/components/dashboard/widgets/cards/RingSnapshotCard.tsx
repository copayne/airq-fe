import React, { memo } from 'react';
import Image from 'next/image';
import { useRingSnapshot } from '~/hooks/useRingSnapshot';
import { env } from '~/env.js';

interface RingSnapshotCardProps {
  deviceId?: string;
}

const RingSnapshotCard: React.FC<RingSnapshotCardProps> = memo(({ deviceId }) => {
  const { snapshot, loading, error, capturing, captureSnapshot } = useRingSnapshot(deviceId);

  // Extract backend base URL from GraphQL endpoint
  const backendBaseUrl = env.NEXT_PUBLIC_GRAPHQL_ENDPOINT.replace('/graphql', '');

  // Construct absolute image URL
  const imageUrl = snapshot ? `${backendBaseUrl}${snapshot.imageUrl}` : '';

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !snapshot) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-airq-light p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airq-dark mb-4"></div>
        <p className="text-airq-dark text-sm">Loading snapshot...</p>
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-airq-light p-4">
        <p className="text-airq-tertiary text-sm mb-4">Error loading snapshot</p>
        <button
          onClick={() => captureSnapshot()}
          disabled={capturing}
          className="px-4 py-2 bg-airq-dark text-airq-light border-[1px] border-airq-dark hover:bg-airq-dark/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {capturing ? 'Capturing...' : 'Retry'}
        </button>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-airq-light p-4">
        <p className="text-airq-dark text-sm mb-4">No snapshot available</p>
        <button
          onClick={() => captureSnapshot()}
          disabled={capturing}
          className="px-4 py-2 bg-airq-dark text-airq-light border-[1px] border-airq-dark hover:bg-airq-dark/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {capturing ? 'Capturing...' : 'Capture Snapshot'}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-airq-light">
      <div className="relative flex-1 bg-airq-dark/5">
        {capturing && (
          <div className="absolute inset-0 bg-airq-dark/50 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airq-light mb-3"></div>
              <p className="text-airq-light text-sm font-medium">Capturing new snapshot...</p>
              <p className="text-airq-light/75 text-xs mt-1">This may take 30-60 seconds</p>
            </div>
          </div>
        )}
        <Image
          src={imageUrl}
          alt={`Ring camera snapshot from ${snapshot.deviceName ?? snapshot.deviceId}`}
          fill
          unoptimized={true}
          className="object-contain p-2"
          priority
        />
      </div>
      <div className="border-t-[1px] border-airq-dark bg-airq-light p-3 flex justify-between items-center">
        <div className="flex flex-col">
          <p className="text-xs text-airq-dark/75 mb-0.5">
            {snapshot.deviceName ?? snapshot.deviceId}
          </p>
          <p className="text-xs text-airq-dark font-medium">
            {formatTimestamp(snapshot.captureTimestamp)}
          </p>
        </div>
        <button
          onClick={() => captureSnapshot()}
          disabled={capturing}
          className="px-3 py-1.5 bg-airq-dark text-airq-light border-[1px] border-airq-dark hover:bg-airq-dark/90 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
        >
          {capturing ? 'Capturing...' : 'Capture New'}
        </button>
      </div>
    </div>
  );
});

RingSnapshotCard.displayName = 'RingSnapshotCard';

export default RingSnapshotCard;
