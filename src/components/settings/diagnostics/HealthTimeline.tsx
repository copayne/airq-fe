import React, { useMemo, useState } from 'react';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Cpu,
  HardDrive,
  MemoryStick,
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
} from 'lucide-react';
import { formatDateTime } from '~/utils/dateUtils';
import { parseUTCTimestamp } from '~/utils/dateUtils';

interface HealthReport {
  id: string;
  reportTime: string;
  serviceRunning: boolean | null;
  sensorConnected: boolean | null;
  sensorDataReady: boolean | null;
  lastCo2Ppm: number | null;
  lastTemperatureCelsius: number | null;
  lastHumidityPercentage: number | null;
  systemUptimeSeconds: number | null;
  diskUsagePercent: number | null;
  memoryUsagePercent: number | null;
  cpuTemperatureCelsius: number | null;
  apiReachable: boolean | null;
  consecutiveFailures: number | null;
  errorMessage: string | null;
}

interface HealthTimelineProps {
  reports: HealthReport[];
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

type ReportStatus = 'healthy' | 'degraded' | 'error';

function getReportStatus(report: HealthReport): ReportStatus {
  if (!report.serviceRunning || report.errorMessage) {
    return 'error';
  }
  if (
    !report.sensorConnected ||
    !report.sensorDataReady ||
    !report.apiReachable ||
    (report.consecutiveFailures !== null && report.consecutiveFailures > 0) ||
    (report.cpuTemperatureCelsius !== null && report.cpuTemperatureCelsius > 70) ||
    (report.memoryUsagePercent !== null && report.memoryUsagePercent > 90) ||
    (report.diskUsagePercent !== null && report.diskUsagePercent > 90)
  ) {
    return 'degraded';
  }
  return 'healthy';
}

const STATUS_COLORS: Record<ReportStatus, string> = {
  healthy: 'bg-airq-primary',
  degraded: 'bg-airq-secondary',
  error: 'bg-airq-tertiary',
};

const STATUS_RING_COLORS: Record<ReportStatus, string> = {
  healthy: 'ring-airq-primary/30',
  degraded: 'ring-airq-secondary/30',
  error: 'ring-airq-tertiary/30',
};

function getGapMinutes(currentTime: string, previousTime: string): number {
  const current = parseUTCTimestamp(currentTime);
  const previous = parseUTCTimestamp(previousTime);
  if (!current || !previous) return 0;
  return Math.abs(current.getTime() - previous.getTime()) / 60000;
}

const TimelineNode: React.FC<{
  report: HealthReport;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ report, isExpanded, onToggle }) => {
  const status = getReportStatus(report);

  return (
    <div className="relative pl-8">
      {/* Status dot */}
      <div className="absolute left-0 top-1.5 flex items-center justify-center">
        <div
          className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]} ring-4 ${STATUS_RING_COLORS[status]}`}
        />
      </div>

      {/* Node content */}
      <button
        onClick={onToggle}
        className="w-full text-left group"
        aria-expanded={isExpanded}
        aria-label={`Health report from ${formatDateTime(report.reportTime)}, status: ${status}`}
      >
        <div className="flex items-center justify-between py-1.5">
          <span className="text-xs font-medium text-airq-dark">
            {formatDateTime(report.reportTime)}
          </span>
          <div className="flex items-center space-x-2">
            {report.errorMessage && (
              <AlertTriangle className="w-3 h-3 text-airq-tertiary" />
            )}
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-airq-dark/40 group-hover:text-airq-dark/70 transition-colors" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-airq-dark/40 group-hover:text-airq-dark/70 transition-colors" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded detail card */}
      {isExpanded && (
        <div className="mb-3 mt-1 border border-airq-dark shadow-card p-3">
          {report.errorMessage && (
            <div className="bg-airq-tertiary/10 border border-airq-tertiary/30 p-2 mb-3 text-xs text-airq-dark flex items-start">
              <AlertTriangle className="w-3 h-3 mr-2 mt-0.5 text-airq-tertiary flex-shrink-0" />
              {report.errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {/* Sensor readings */}
            <div className="flex items-center space-x-1.5">
              <Wind className="w-3 h-3 text-airq-dark/40" />
              <span className="text-airq-dark/50">CO2:</span>
              <span className="text-airq-dark">
                {report.lastCo2Ppm !== null ? `${report.lastCo2Ppm} ppm` : '--'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Thermometer className="w-3 h-3 text-airq-dark/40" />
              <span className="text-airq-dark/50">Temp:</span>
              <span className="text-airq-dark">
                {report.lastTemperatureCelsius !== null
                  ? `${report.lastTemperatureCelsius.toFixed(1)}°C`
                  : '--'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Droplets className="w-3 h-3 text-airq-dark/40" />
              <span className="text-airq-dark/50">Humidity:</span>
              <span className="text-airq-dark">
                {report.lastHumidityPercentage !== null
                  ? `${report.lastHumidityPercentage.toFixed(0)}%`
                  : '--'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Activity className="w-3 h-3 text-airq-dark/40" />
              <span className="text-airq-dark/50">Uptime:</span>
              <span className="text-airq-dark">
                {report.systemUptimeSeconds !== null
                  ? formatDuration(report.systemUptimeSeconds)
                  : '--'}
              </span>
            </div>

            {/* System metrics */}
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3 h-3 text-airq-dark/40" />
              <span className="text-airq-dark/50">CPU:</span>
              <span
                className={
                  (report.cpuTemperatureCelsius ?? 0) > 70
                    ? 'text-airq-tertiary'
                    : 'text-airq-dark'
                }
              >
                {report.cpuTemperatureCelsius !== null
                  ? `${report.cpuTemperatureCelsius.toFixed(0)}°C`
                  : '--'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <MemoryStick className="w-3 h-3 text-airq-dark/40" />
              <span className="text-airq-dark/50">Memory:</span>
              <span
                className={
                  (report.memoryUsagePercent ?? 0) > 90
                    ? 'text-airq-tertiary'
                    : 'text-airq-dark'
                }
              >
                {report.memoryUsagePercent !== null
                  ? `${report.memoryUsagePercent.toFixed(0)}%`
                  : '--'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <HardDrive className="w-3 h-3 text-airq-dark/40" />
              <span className="text-airq-dark/50">Disk:</span>
              <span
                className={
                  (report.diskUsagePercent ?? 0) > 90
                    ? 'text-airq-tertiary'
                    : 'text-airq-dark'
                }
              >
                {report.diskUsagePercent !== null
                  ? `${report.diskUsagePercent.toFixed(0)}%`
                  : '--'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3 h-3 text-airq-dark/40" />
              <span className="text-airq-dark/50">Failures:</span>
              <span
                className={
                  report.consecutiveFailures
                    ? 'text-airq-tertiary'
                    : 'text-airq-dark'
                }
              >
                {report.consecutiveFailures ?? 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ reports }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedReports = useMemo(
    () =>
      [...reports].sort((a, b) => {
        const dateA = parseUTCTimestamp(a.reportTime);
        const dateB = parseUTCTimestamp(b.reportTime);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      }),
    [reports],
  );

  const summaryStats = useMemo(() => {
    if (reports.length === 0) return null;

    const healthyCount = reports.filter(
      (r) => r.serviceRunning && r.sensorConnected,
    ).length;
    const uptimePercent = ((healthyCount / reports.length) * 100).toFixed(1);

    const cpuTemps = reports
      .map((r) => r.cpuTemperatureCelsius)
      .filter((v): v is number => v !== null);
    const avgCpuTemp =
      cpuTemps.length > 0
        ? (cpuTemps.reduce((sum, v) => sum + v, 0) / cpuTemps.length).toFixed(0)
        : null;

    const memUsages = reports
      .map((r) => r.memoryUsagePercent)
      .filter((v): v is number => v !== null);
    const avgMemory =
      memUsages.length > 0
        ? (memUsages.reduce((sum, v) => sum + v, 0) / memUsages.length).toFixed(0)
        : null;

    return { uptimePercent, avgCpuTemp, avgMemory };
  }, [reports]);

  if (reports.length === 0) {
    return (
      <div className="p-6 text-center">
        <Activity className="w-6 h-6 mx-auto text-airq-dark/30 mb-2" />
        <p className="text-sm text-airq-dark/70">No health reports available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      {summaryStats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-airq-dark p-2.5 text-center">
            <p className="text-xxs uppercase tracking-wide text-airq-dark/50">
              Uptime
            </p>
            <p
              className={`text-sm font-medium ${
                parseFloat(summaryStats.uptimePercent) >= 95
                  ? 'text-airq-primary'
                  : parseFloat(summaryStats.uptimePercent) >= 80
                    ? 'text-airq-secondary'
                    : 'text-airq-tertiary'
              }`}
            >
              {summaryStats.uptimePercent}%
            </p>
          </div>
          <div className="border border-airq-dark p-2.5 text-center">
            <p className="text-xxs uppercase tracking-wide text-airq-dark/50">
              Avg CPU Temp
            </p>
            <p className="text-sm font-medium text-airq-dark">
              {summaryStats.avgCpuTemp !== null
                ? `${summaryStats.avgCpuTemp}°C`
                : '--'}
            </p>
          </div>
          <div className="border border-airq-dark p-2.5 text-center">
            <p className="text-xxs uppercase tracking-wide text-airq-dark/50">
              Avg Memory
            </p>
            <p className="text-sm font-medium text-airq-dark">
              {summaryStats.avgMemory !== null
                ? `${summaryStats.avgMemory}%`
                : '--'}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {sortedReports.map((report, index) => {
          const showGap =
            index < sortedReports.length - 1 &&
            getGapMinutes(
              report.reportTime,
              sortedReports[index + 1]!.reportTime,
            ) > 10;

          return (
            <React.Fragment key={report.id}>
              {/* Vertical connector line */}
              {index < sortedReports.length - 1 && (
                <div
                  className={`absolute left-[5px] w-px ${
                    showGap
                      ? 'border-l border-dashed border-airq-dark/20'
                      : 'bg-airq-dark/15'
                  }`}
                  style={{
                    top: 0,
                    height: '100%',
                  }}
                  aria-hidden="true"
                />
              )}

              <TimelineNode
                report={report}
                isExpanded={expandedId === report.id}
                onToggle={() =>
                  setExpandedId(expandedId === report.id ? null : report.id)
                }
              />

              {/* Gap indicator */}
              {showGap && (
                <div className="relative pl-8 py-2">
                  <div className="absolute left-[5px] top-0 bottom-0 w-px border-l border-dashed border-airq-dark/20" aria-hidden="true" />
                  <p className="text-xxs text-airq-dark/40 italic">
                    {Math.round(
                      getGapMinutes(
                        report.reportTime,
                        sortedReports[index + 1]!.reportTime,
                      ),
                    )}{' '}
                    min gap
                  </p>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default HealthTimeline;
