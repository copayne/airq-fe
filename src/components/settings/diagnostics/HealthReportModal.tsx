import React from 'react';
import { CheckCircle, XCircle, Server, Cpu, HardDrive, Thermometer, Wifi, AlertTriangle } from 'lucide-react';
import Modal from '~/components/common/Modal';
import { formatDateTime, formatDuration } from '~/utils/dateUtils';

interface SensorHealth {
  sensorId: number;
  sensorName: string;
  ipAddress: string | null;
}

interface PingResult {
  success: boolean;
  message: string;
  sensorId: number;
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
  pingResponseTimeMs: number | null;
}

interface HealthReportModalProps {
  sensor: SensorHealth;
  result: PingResult;
  onClose: () => void;
}


const StatusBadge: React.FC<{ value: boolean | null; trueText: string; falseText: string }> = ({
  value,
  trueText,
  falseText,
}) => {
  if (value === null) {
    return <span className="text-airq-dark/50">Unknown</span>;
  }
  return value ? (
    <span className="text-airq-primary flex items-center">
      <CheckCircle className="w-3 h-3 mr-1" />
      {trueText}
    </span>
  ) : (
    <span className="text-airq-tertiary flex items-center">
      <XCircle className="w-3 h-3 mr-1" />
      {falseText}
    </span>
  );
};

export const HealthReportModal: React.FC<HealthReportModalProps> = ({
  sensor,
  result,
  onClose,
}) => {
  return (
    <Modal isOpen={true} onClose={onClose} title={`Health Check - ${sensor.sensorName}`} size="lg">
      <p className="text-xs text-airq-dark/50 mb-4">{sensor.ipAddress}</p>

      <div className="max-h-[60vh] overflow-y-auto -mx-4 px-4">
        {/* Overall Status */}
        <div className={`p-4 mb-4 border ${result.success ? 'bg-airq-primary/10 border-airq-primary' : 'bg-airq-tertiary/10 border-airq-tertiary'}`}>
          <div className="flex items-center space-x-3">
            {result.success ? (
              <CheckCircle className="w-6 h-6 text-airq-primary" />
            ) : (
              <XCircle className="w-6 h-6 text-airq-tertiary" />
            )}
            <div>
              <p className={`font-medium ${result.success ? 'text-airq-primary' : 'text-airq-tertiary'}`}>
                {result.success ? 'Health Check Passed' : 'Health Check Failed'}
              </p>
              <p className="text-sm text-airq-dark/70">{result.message}</p>
            </div>
          </div>
          {result.pingResponseTimeMs !== null && (
            <p className="text-xs text-airq-dark/50 mt-2">
              Response time: {result.pingResponseTimeMs}ms
            </p>
          )}
        </div>

        {/* Error Message */}
        {result.errorMessage && (
          <div className="bg-airq-tertiary/10 border border-airq-tertiary p-3 mb-4 text-sm text-airq-tertiary">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error Details</p>
                <p className="text-airq-dark/70 mt-1">{result.errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {result.success && (
          <div className="space-y-4">
            {/* Service Status */}
            <div className="border border-airq-dark/20">
              <div className="bg-airq-dark/5 px-3 py-2 border-b border-airq-dark/20 flex items-center">
                <Server className="w-4 h-4 mr-2 text-airq-dark/60" />
                <span className="text-sm font-medium text-airq-dark">Service Status</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">Service Running</p>
                  <StatusBadge value={result.serviceRunning} trueText="Running" falseText="Stopped" />
                </div>
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">Service Uptime</p>
                  <p className="text-airq-dark">
                    {result.serviceUptimeSeconds !== null
                      ? formatDuration(result.serviceUptimeSeconds, true)
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sensor Hardware */}
            <div className="border border-airq-dark/20">
              <div className="bg-airq-dark/5 px-3 py-2 border-b border-airq-dark/20 flex items-center">
                <Cpu className="w-4 h-4 mr-2 text-airq-dark/60" />
                <span className="text-sm font-medium text-airq-dark">Sensor Hardware</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">Sensor Connected</p>
                  <StatusBadge value={result.sensorConnected} trueText="Connected" falseText="Disconnected" />
                </div>
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">Data Ready</p>
                  <StatusBadge value={result.sensorDataReady} trueText="Ready" falseText="Not Ready" />
                </div>
                <div className="col-span-2">
                  <p className="text-airq-dark/60 text-xs mb-1">Serial Number</p>
                  <p className="text-airq-dark font-mono">
                    {result.sensorSerialNumber ?? 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Latest Readings */}
            <div className="border border-airq-dark/20">
              <div className="bg-airq-dark/5 px-3 py-2 border-b border-airq-dark/20 flex items-center">
                <Thermometer className="w-4 h-4 mr-2 text-airq-dark/60" />
                <span className="text-sm font-medium text-airq-dark">Latest Readings</span>
              </div>
              <div className="p-3 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">CO2</p>
                  <p className="text-airq-dark font-medium">
                    {result.lastCo2Ppm !== null ? `${result.lastCo2Ppm} ppm` : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">Temperature</p>
                  <p className="text-airq-dark font-medium">
                    {result.lastTemperatureCelsius !== null
                      ? `${result.lastTemperatureCelsius.toFixed(1)}°C`
                      : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">Humidity</p>
                  <p className="text-airq-dark font-medium">
                    {result.lastHumidityPercentage !== null
                      ? `${result.lastHumidityPercentage.toFixed(1)}%`
                      : '--'}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-airq-dark/60 text-xs mb-1">Last Reading Time</p>
                  <p className="text-airq-dark">{formatDateTime(result.lastReadingTime, 'Unknown')}</p>
                </div>
              </div>
            </div>

            {/* System Metrics */}
            <div className="border border-airq-dark/20">
              <div className="bg-airq-dark/5 px-3 py-2 border-b border-airq-dark/20 flex items-center">
                <HardDrive className="w-4 h-4 mr-2 text-airq-dark/60" />
                <span className="text-sm font-medium text-airq-dark">System Metrics</span>
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">System Uptime</p>
                  <p className="text-airq-dark">
                    {result.systemUptimeSeconds !== null
                      ? formatDuration(result.systemUptimeSeconds, true)
                      : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">Disk Usage</p>
                  <p className={`${(result.diskUsagePercent ?? 0) > 90 ? 'text-airq-tertiary' : 'text-airq-dark'}`}>
                    {result.diskUsagePercent !== null
                      ? `${result.diskUsagePercent.toFixed(1)}%`
                      : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">Memory Usage</p>
                  <p className={`${(result.memoryUsagePercent ?? 0) > 90 ? 'text-airq-tertiary' : 'text-airq-dark'}`}>
                    {result.memoryUsagePercent !== null
                      ? `${result.memoryUsagePercent.toFixed(1)}%`
                      : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">CPU Temperature</p>
                  <p className={`${(result.cpuTemperatureCelsius ?? 0) > 70 ? 'text-airq-tertiary' : 'text-airq-dark'}`}>
                    {result.cpuTemperatureCelsius !== null
                      ? `${result.cpuTemperatureCelsius.toFixed(1)}°C`
                      : '--'}
                  </p>
                </div>
              </div>
            </div>

            {/* API Connectivity */}
            <div className="border border-airq-dark/20">
              <div className="bg-airq-dark/5 px-3 py-2 border-b border-airq-dark/20 flex items-center">
                <Wifi className="w-4 h-4 mr-2 text-airq-dark/60" />
                <span className="text-sm font-medium text-airq-dark">API Connectivity</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">API Reachable</p>
                  <StatusBadge value={result.apiReachable} trueText="Reachable" falseText="Unreachable" />
                </div>
                <div>
                  <p className="text-airq-dark/60 text-xs mb-1">API Response Time</p>
                  <p className="text-airq-dark">
                    {result.apiResponseTimeMs !== null ? `${result.apiResponseTimeMs}ms` : '--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Failure Tracking */}
            {result.consecutiveFailures !== null && result.consecutiveFailures > 0 && (
              <div className="bg-airq-secondary/10 border border-airq-secondary p-3 text-sm">
                <div className="flex items-center text-airq-dark">
                  <AlertTriangle className="w-4 h-4 mr-2 text-airq-secondary" />
                  <span>
                    {result.consecutiveFailures} consecutive failure{result.consecutiveFailures !== 1 ? 's' : ''} recorded
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-airq-dark/20 -mx-4 px-4 pt-3 mt-4 flex justify-end">
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

export default HealthReportModal;
