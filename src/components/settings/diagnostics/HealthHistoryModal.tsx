import React from 'react';
import { useQuery } from '@apollo/client';
import { CheckCircle, XCircle, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import Modal from '~/components/common/Modal';
import { GET_SENSOR_HEALTH_REPORTS } from '~/graphql/SensorHealth';
import { formatDateTime } from '~/utils/dateUtils';

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


const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
};

const StatusIcon: React.FC<{ value: boolean | null }> = ({ value }) => {
  if (value === null) return <span className="text-airq-dark/30">-</span>;
  return value ? (
    <CheckCircle className="w-4 h-4 text-airq-primary" />
  ) : (
    <XCircle className="w-4 h-4 text-airq-tertiary" />
  );
};

export const HealthHistoryModal: React.FC<HealthHistoryModalProps> = ({
  sensor,
  onClose,
}) => {
  const { data, loading, error, refetch } = useQuery<{
    sensorHealthReports: HealthReport[];
  }>(GET_SENSOR_HEALTH_REPORTS, {
    variables: { sensorId: sensor.sensorId, limit: 20 },
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
          <div className="divide-y divide-airq-dark/10">
            {reports.map((report) => (
              <div key={report.id} className="py-4 first:pt-0">
                {/* Report Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-airq-dark/50" />
                    <span className="text-sm font-medium text-airq-dark">
                      {formatDateTime(report.reportTime)}
                    </span>
                  </div>
                  {report.errorMessage && (
                    <span className="text-xs px-2 py-0.5 bg-airq-tertiary/10 text-airq-tertiary">
                      Error
                    </span>
                  )}
                </div>

                {/* Error Message */}
                {report.errorMessage && (
                  <div className="bg-airq-tertiary/10 border border-airq-tertiary/30 p-2 mb-3 text-xs text-airq-dark flex items-start">
                    <AlertTriangle className="w-3 h-3 mr-2 mt-0.5 text-airq-tertiary flex-shrink-0" />
                    {report.errorMessage}
                  </div>
                )}

                {/* Report Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                  {/* Status Indicators */}
                  <div className="flex items-center space-x-2">
                    <StatusIcon value={report.serviceRunning} />
                    <span className="text-airq-dark/70">Service</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon value={report.sensorConnected} />
                    <span className="text-airq-dark/70">Sensor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon value={report.apiReachable} />
                    <span className="text-airq-dark/70">API</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon value={report.sensorDataReady} />
                    <span className="text-airq-dark/70">Data Ready</span>
                  </div>

                  {/* Readings */}
                  <div>
                    <span className="text-airq-dark/50">CO2:</span>{' '}
                    <span className="text-airq-dark">
                      {report.lastCo2Ppm !== null ? `${report.lastCo2Ppm} ppm` : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-airq-dark/50">Temp:</span>{' '}
                    <span className="text-airq-dark">
                      {report.lastTemperatureCelsius !== null
                        ? `${report.lastTemperatureCelsius.toFixed(1)}°C`
                        : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-airq-dark/50">Humidity:</span>{' '}
                    <span className="text-airq-dark">
                      {report.lastHumidityPercentage !== null
                        ? `${report.lastHumidityPercentage.toFixed(0)}%`
                        : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-airq-dark/50">Failures:</span>{' '}
                    <span className={report.consecutiveFailures ? 'text-airq-tertiary' : 'text-airq-dark'}>
                      {report.consecutiveFailures ?? 0}
                    </span>
                  </div>

                  {/* System Metrics */}
                  <div>
                    <span className="text-airq-dark/50">Disk:</span>{' '}
                    <span className={`${(report.diskUsagePercent ?? 0) > 90 ? 'text-airq-tertiary' : 'text-airq-dark'}`}>
                      {report.diskUsagePercent !== null
                        ? `${report.diskUsagePercent.toFixed(0)}%`
                        : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-airq-dark/50">Memory:</span>{' '}
                    <span className={`${(report.memoryUsagePercent ?? 0) > 90 ? 'text-airq-tertiary' : 'text-airq-dark'}`}>
                      {report.memoryUsagePercent !== null
                        ? `${report.memoryUsagePercent.toFixed(0)}%`
                        : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-airq-dark/50">CPU:</span>{' '}
                    <span className={`${(report.cpuTemperatureCelsius ?? 0) > 70 ? 'text-airq-tertiary' : 'text-airq-dark'}`}>
                      {report.cpuTemperatureCelsius !== null
                        ? `${report.cpuTemperatureCelsius.toFixed(0)}°C`
                        : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-airq-dark/50">Uptime:</span>{' '}
                    <span className="text-airq-dark">
                      {report.systemUptimeSeconds !== null
                        ? formatDuration(report.systemUptimeSeconds)
                        : '--'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
