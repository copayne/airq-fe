import React from 'react';
import { useQuery } from '@apollo/client';
import { RefreshCw, Clock } from 'lucide-react';
import Modal from '~/components/common/Modal';
import { GET_SENSOR_HEALTH_REPORTS } from '~/graphql/SensorHealth';
import { HealthTimeline } from './HealthTimeline';

interface SensorHealth {
  sensorId: number;
  sensorName: string;
}

interface HealthReport {
  id: string;
  reportTime: string;
  serviceRunning: boolean | null;
  serviceUptimeSeconds: number | null;
  sensorConnected: boolean | null;
  sensorDataReady: boolean | null;
  sensorSerialNumber: string | null;
  lastCo2Ppm: number | null;
  lastTemperatureCelsius: number | null;
  lastHumidityPercentage: number | null;
  lastReadingTime: string | null;
  systemUptimeSeconds: number | null;
  diskUsagePercent: number | null;
  memoryUsagePercent: number | null;
  cpuTemperatureCelsius: number | null;
  apiReachable: boolean | null;
  apiResponseTimeMs: number | null;
  errorMessage: string | null;
  consecutiveFailures: number | null;
}

interface HealthHistoryModalProps {
  sensor: SensorHealth;
  onClose: () => void;
}


export const HealthHistoryModal: React.FC<HealthHistoryModalProps> = ({
  sensor,
  onClose,
}) => {
  const { data, loading, error, refetch } = useQuery<{
    sensorHealthReports: HealthReport[];
  }>(GET_SENSOR_HEALTH_REPORTS, {
    variables: { sensorId: sensor.sensorId, limit: 50 },
    fetchPolicy: 'network-only',
  });

  const reports = data?.sensorHealthReports ?? [];

  return (
    <Modal isOpen={true} onClose={onClose} title={`Health History - ${sensor.sensorName}`} size="lg">
      <div className="flex justify-end mb-3">
        <button
          onClick={() => void refetch()}
          className="flex items-center text-xs text-airq-dark/70 hover:text-airq-dark transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto -mx-4 px-4">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-airq-dark/50" />
            <p className="mt-2 text-sm text-airq-dark/70">Loading history...</p>
          </div>
        ) : error ? (
          <div className="bg-airq-tertiary/10 border border-airq-tertiary p-3 text-sm text-airq-tertiary">
            Error loading history: {error.message}
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-8 h-8 mx-auto text-airq-dark/30 mb-2" />
            <p className="text-sm text-airq-dark/70">No health check history available.</p>
            <p className="text-xs text-airq-dark/50 mt-1">
              Run a health check to start recording history.
            </p>
          </div>
        ) : (
          <HealthTimeline reports={reports} />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-airq-dark/20 -mx-4 px-4 pt-3 mt-4 flex justify-between items-center">
        <p className="text-xs text-airq-dark/50">
          Showing last {reports.length} health check{reports.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-airq-dark text-airq-light border border-airq-dark shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all text-sm"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default HealthHistoryModal;
