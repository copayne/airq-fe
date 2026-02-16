import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Activity, RefreshCw, Wifi, WifiOff, Clock, AlertTriangle, CheckCircle, XCircle, Cpu, Thermometer } from 'lucide-react';
import { GET_ALL_SENSOR_HEALTH, PING_SENSOR } from '~/graphql/SensorHealth';
import { HealthReportModal } from './HealthReportModal';
import { HealthHistoryModal } from './HealthHistoryModal';
import { useRealtime } from '~/context/RealtimeContext';

interface SensorHealth {
  sensorId: number;
  sensorName: string;
  healthStatus: string;
  isActive: boolean;
  lastReadingTime: string | null;
  lastSuccessfulReadingTime: string | null;
  minutesSinceLastReading: number | null;
  consecutiveFailures: number;
  totalReadings: number;
  totalFailures: number;
  successRate: number;
  ipAddress: string | null;
  healthCheckPort: number | null;
  latestCo2Ppm: number | null;
  latestTemperatureCelsius: number | null;
  latestHumidityPercentage: number | null;
  lastHealthCheck: string | null;
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'text-airq-primary bg-airq-primary/10';
    case 'degraded':
      return 'text-airq-secondary bg-airq-secondary/10';
    case 'offline':
      return 'text-airq-tertiary bg-airq-tertiary/10';
    case 'inactive':
      return 'text-airq-dark/50 bg-airq-dark/5';
    default:
      return 'text-airq-dark/50 bg-airq-dark/5';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="w-4 h-4" />;
    case 'degraded':
      return <AlertTriangle className="w-4 h-4" />;
    case 'offline':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

export const DiagnosticsList: React.FC = () => {
  const [selectedSensor, setSelectedSensor] = useState<SensorHealth | null>(null);
  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [showPingResult, setShowPingResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pingingId, setPingingId] = useState<number | null>(null);
  const isPingingRef = useRef(false);
  const { onSensorHealth } = useRealtime();

  const { data, loading, error, refetch } = useQuery<{ allSensorHealth: SensorHealth[] }>(
    GET_ALL_SENSOR_HEALTH,
    { fetchPolicy: 'network-only' }
  );

  // Auto-refresh when a new health report arrives via WebSocket
  useEffect(() => {
    return onSensorHealth(() => {
      void refetch();
    });
  }, [onSensorHealth, refetch]);

  const [pingSensor, { loading: pingSensorLoading }] = useMutation<{ pingSensor: PingResult }>(PING_SENSOR, {
    onCompleted: (data) => {
      isPingingRef.current = false;
      setPingResult(data.pingSensor);
      setShowPingResult(true);
      setPingingId(null);
      void refetch();
    },
    onError: (error) => {
      isPingingRef.current = false;
      setPingResult({
        success: false,
        message: error.message,
        sensorId: pingingId ?? 0,
        serviceRunning: null,
        serviceUptimeSeconds: null,
        sensorConnected: null,
        sensorDataReady: null,
        sensorSerialNumber: null,
        lastCo2Ppm: null,
        lastTemperatureCelsius: null,
        lastHumidityPercentage: null,
        lastReadingTime: null,
        systemUptimeSeconds: null,
        diskUsagePercent: null,
        memoryUsagePercent: null,
        cpuTemperatureCelsius: null,
        apiReachable: null,
        apiResponseTimeMs: null,
        errorMessage: error.message,
        consecutiveFailures: null,
        pingResponseTimeMs: null,
      });
      setShowPingResult(true);
      setPingingId(null);
    },
  });

  const handlePing = (sensor: SensorHealth) => {
    // Prevent double-clicks using ref (immediate) and state (for UI)
    if (isPingingRef.current || pingSensorLoading || pingingId !== null) {
      return;
    }
    isPingingRef.current = true;
    setSelectedSensor(sensor);
    setPingingId(sensor.sensorId);
    void pingSensor({ variables: { sensorId: sensor.sensorId } });
  };

  const handleViewHistory = (sensor: SensorHealth) => {
    setSelectedSensor(sensor);
    setShowHistory(true);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-airq-dark/50" />
        <p className="mt-2 text-sm text-airq-dark/70">Loading sensor health data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-airq-tertiary/10 border border-airq-tertiary p-4 text-sm text-airq-tertiary">
          Error loading sensor health: {error.message}
        </div>
      </div>
    );
  }

  const sensors = data?.allSensorHealth ?? [];

  return (
    <>
      {/* Header */}
      <div className="bg-airq-dark text-airq-light px-4 py-3 border-b border-black/80 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold">sensor health overview</p>
          <p className="text-xs text-airq-light/70 mt-0.5">
            {sensors.length} sensor{sensors.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          className="p-2 hover:bg-airq-light/10 transition-colors rounded"
          title="Refresh health data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Sensor List */}
      {sensors.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-12 h-12 border border-airq-dark flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-6 h-6 text-airq-dark/60" />
          </div>
          <h3 className="text-sm font-medium text-airq-dark">No Sensors Found</h3>
          <p className="text-xs text-airq-dark/70 mt-1">
            Add sensors in the Sensors settings to monitor their health.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-airq-dark/20">
          {sensors.map((sensor) => (
            <div key={sensor.sensorId} className="p-4">
              {/* Sensor Header Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 flex items-center justify-center border border-airq-dark ${getStatusColor(sensor.healthStatus)}`}>
                    {getStatusIcon(sensor.healthStatus)}
                  </div>
                  <div>
                    <h3 className="font-medium text-airq-dark">{sensor.sensorName}</h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 ${getStatusColor(sensor.healthStatus)}`}>
                        {sensor.healthStatus}
                      </span>
                      {sensor.ipAddress && (
                        <span className="text-xs text-airq-dark/50 flex items-center">
                          <Wifi className="w-3 h-3 mr-1" />
                          {sensor.ipAddress}:{sensor.healthCheckPort}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewHistory(sensor)}
                    className="px-3 py-1.5 text-xs border border-airq-dark bg-airq-light text-airq-dark shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
                  >
                    History
                  </button>
                  <button
                    onClick={() => handlePing(sensor)}
                    disabled={!sensor.ipAddress || pingingId === sensor.sensorId}
                    className={`px-3 py-1.5 text-xs border border-airq-dark shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all flex items-center space-x-1 ${
                      sensor.ipAddress
                        ? 'bg-airq-primary text-airq-light'
                        : 'bg-airq-dark/20 text-airq-dark/50 cursor-not-allowed'
                    }`}
                    title={!sensor.ipAddress ? 'No IP address configured' : 'Run health check'}
                  >
                    {pingingId === sensor.sensorId ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Pinging...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-3 h-3" />
                        <span>Run Check</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Last Reading */}
                <div className="bg-airq-dark/5 p-2 border border-airq-dark/10">
                  <div className="flex items-center text-airq-dark/60 mb-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Last Reading
                  </div>
                  <div className="font-medium text-airq-dark">
                    {sensor.minutesSinceLastReading !== null
                      ? `${sensor.minutesSinceLastReading} min ago`
                      : 'Never'}
                  </div>
                </div>

                {/* Success Rate */}
                <div className="bg-airq-dark/5 p-2 border border-airq-dark/10">
                  <div className="flex items-center text-airq-dark/60 mb-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Success Rate
                  </div>
                  <div className="font-medium text-airq-dark">
                    {sensor.successRate?.toFixed(1) ?? 0}%
                    <span className="text-airq-dark/50 ml-1">
                      ({sensor.totalReadings ?? 0} total)
                    </span>
                  </div>
                </div>

                {/* Consecutive Failures */}
                <div className="bg-airq-dark/5 p-2 border border-airq-dark/10">
                  <div className="flex items-center text-airq-dark/60 mb-1">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Failures
                  </div>
                  <div className={`font-medium ${sensor.consecutiveFailures > 0 ? 'text-airq-tertiary' : 'text-airq-dark'}`}>
                    {sensor.consecutiveFailures} consecutive
                    <span className="text-airq-dark/50 ml-1">
                      ({sensor.totalFailures ?? 0} total)
                    </span>
                  </div>
                </div>

                {/* Latest Values */}
                <div className="bg-airq-dark/5 p-2 border border-airq-dark/10">
                  <div className="flex items-center text-airq-dark/60 mb-1">
                    <Thermometer className="w-3 h-3 mr-1" />
                    Latest Values
                  </div>
                  <div className="font-medium text-airq-dark">
                    {sensor.latestCo2Ppm !== null ? (
                      <span>
                        {sensor.latestCo2Ppm} ppm / {sensor.latestTemperatureCelsius?.toFixed(1)}°C
                      </span>
                    ) : (
                      <span className="text-airq-dark/50">No data</span>
                    )}
                  </div>
                </div>
              </div>

              {/* No IP Warning */}
              {!sensor.ipAddress && (
                <div className="mt-3 bg-airq-secondary/10 border border-airq-secondary/30 p-2 text-xs text-airq-dark flex items-center">
                  <WifiOff className="w-4 h-4 mr-2 text-airq-secondary" />
                  No IP address configured. Configure the sensor&apos;s network settings to enable health checks.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ping Result Modal */}
      {showPingResult && pingResult && selectedSensor && (
        <HealthReportModal
          sensor={selectedSensor}
          result={pingResult}
          onClose={() => {
            setShowPingResult(false);
            setPingResult(null);
          }}
        />
      )}

      {/* History Modal */}
      {showHistory && selectedSensor && (
        <HealthHistoryModal
          sensor={selectedSensor}
          onClose={() => {
            setShowHistory(false);
            setSelectedSensor(null);
          }}
        />
      )}
    </>
  );
};

export default DiagnosticsList;
