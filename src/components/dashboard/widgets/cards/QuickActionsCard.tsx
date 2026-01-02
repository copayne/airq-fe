/**
 * Quick Actions Card
 *
 * Provides quick action buttons for common dashboard operations:
 * - Capture camera snapshot
 * - Refresh Ring devices
 * - Refresh sensor data
 */

import React, { memo, useState, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { useRing } from '~/context/RingContext';
import { useRingSnapshot } from '~/hooks/useRingSnapshot';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  icon: React.ReactNode;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = memo(({ label, onClick, loading, icon, disabled }) => (
  <button
    onClick={onClick}
    disabled={Boolean(loading) || Boolean(disabled)}
    className="flex flex-col items-center justify-center p-3 bg-airq-light border border-airq-dark hover:bg-airq-dark hover:text-airq-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
  >
    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
      {loading ? (
        <div className="animate-spin h-6 w-6 border-2 border-airq-dark group-hover:border-airq-light border-t-transparent rounded-full" />
      ) : (
        icon
      )}
    </div>
    <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
  </button>
));

ActionButton.displayName = 'ActionButton';

const QuickActionsCard: React.FC = memo(() => {
  const apolloClient = useApolloClient();
  const { refresh: refreshRing } = useRing();
  const { capturing, captureSnapshot } = useRingSnapshot('59852574', { captureOnMount: false });

  const [refreshingSensors, setRefreshingSensors] = useState(false);
  const [refreshingRing, setRefreshingRing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleCaptureSnapshot = useCallback(async () => {
    setLastAction('Capturing snapshot...');
    await captureSnapshot();
    setLastAction('Snapshot captured!');
    setTimeout(() => setLastAction(null), 3000);
  }, [captureSnapshot]);

  const handleRefreshSensors = useCallback(async () => {
    setRefreshingSensors(true);
    setLastAction('Refreshing sensors...');
    try {
      await apolloClient.refetchQueries({
        include: ['GetSensors', 'GetSensorReadings', 'GetFilteredSensorReadings', 'GetDailyAirQualityScores', 'GetAirQualityDistributionsByPeriod'],
      });
      setLastAction('Sensors refreshed!');
    } catch (error) {
      setLastAction('Refresh failed');
      console.error('Failed to refresh sensors:', error);
    } finally {
      setRefreshingSensors(false);
      setTimeout(() => setLastAction(null), 3000);
    }
  }, [apolloClient]);

  const handleRefreshRing = useCallback(async () => {
    setRefreshingRing(true);
    setLastAction('Refreshing Ring...');
    try {
      await refreshRing();
      setLastAction('Ring refreshed!');
    } catch (error) {
      setLastAction('Refresh failed');
      console.error('Failed to refresh Ring:', error);
    } finally {
      setRefreshingRing(false);
      setTimeout(() => setLastAction(null), 3000);
    }
  }, [refreshRing]);

  const handleRefreshAll = useCallback(async () => {
    setLastAction('Refreshing all...');
    await Promise.all([
      handleRefreshSensors(),
      handleRefreshRing(),
    ]);
    setLastAction('All refreshed!');
    setTimeout(() => setLastAction(null), 3000);
  }, [handleRefreshSensors, handleRefreshRing]);

  return (
    <div className="h-full w-full flex flex-col bg-airq-light p-2">
      <div className="grid grid-cols-2 gap-2 flex-1">
        <ActionButton
          label="Capture Snapshot"
          onClick={handleCaptureSnapshot}
          loading={capturing}
          icon={<span>📷</span>}
        />
        <ActionButton
          label="Refresh Sensors"
          onClick={handleRefreshSensors}
          loading={refreshingSensors}
          icon={<span>🌡️</span>}
        />
        <ActionButton
          label="Refresh Ring"
          onClick={handleRefreshRing}
          loading={refreshingRing}
          icon={<span>🔔</span>}
        />
        <ActionButton
          label="Refresh All"
          onClick={handleRefreshAll}
          loading={refreshingSensors || refreshingRing}
          icon={<span>🔄</span>}
        />
      </div>
      {lastAction && (
        <div className="mt-2 text-center text-xs text-airq-dark/75 bg-airq-dark/5 py-1 rounded">
          {lastAction}
        </div>
      )}
    </div>
  );
});

QuickActionsCard.displayName = 'QuickActionsCard';

export default QuickActionsCard;
