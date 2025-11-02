import React from 'react';
import RingSnapshotCard from '../cards/RingSnapshotCard';

interface RingSnapshotWrapperProps {
  deviceId?: string;
}

const RingSnapshotWrapper: React.FC<RingSnapshotWrapperProps> = ({ deviceId }) => {
  return <RingSnapshotCard deviceId={deviceId} />;
};

export default RingSnapshotWrapper;
