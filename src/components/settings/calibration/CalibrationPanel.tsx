import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Crosshair, RefreshCw, ToggleLeft, ToggleRight, Thermometer, RotateCcw, Loader2, CheckCircle, XCircle, AlertTriangle, Wind } from 'lucide-react';
import { useSensors } from '~/hooks/useSensors';
import { Modal } from '~/components/common/Modal';
import {
  CALIBRATE_SENSOR_FRC,
  SET_SENSOR_ASC,
  SET_SENSOR_TEMPERATURE_OFFSET,
  FACTORY_RESET_SENSOR,
  GET_SENSOR_CALIBRATION_STATUS,
  type CalibrateFRCResponse,
  type SetASCResponse,
  type SetTemperatureOffsetResponse,
  type FactoryResetResponse,
  type GetCalibrationStatusResponse,
  type CalibrationStatus,
} from '~/graphql/Calibration';

interface SensorCalibrationInfo {
  id: string;
  name: string;
  hostname: string;
  isActive: boolean;
  lastCalibrationTime?: string | null;
  lastCalibrationReferenceCo2?: number | null;
  autoCalibrationEnabled?: boolean | null;
  temperatureOffset?: number | null;
  ipAddress?: string | null;
  calibrationPort?: number | null;
}

export const CalibrationPanel: React.FC = () => {
  const { sensors, loading, error } = useSensors({ includeLastReading: false });
  const [selectedSensor, setSelectedSensor] = useState<SensorCalibrationInfo | null>(null);
  const [showFRCModal, setShowFRCModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showTempOffsetModal, setShowTempOffsetModal] = useState(false);
  const [statusData, setStatusData] = useState<CalibrationStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [calibrateFRC, { loading: frcLoading }] = useMutation<CalibrateFRCResponse>(CALIBRATE_SENSOR_FRC);
  const [setSensorASC, { loading: ascLoading }] = useMutation<SetASCResponse>(SET_SENSOR_ASC);
  const [setTempOffset, { loading: tempLoading }] = useMutation<SetTemperatureOffsetResponse>(SET_SENSOR_TEMPERATURE_OFFSET);
  const [factoryReset, { loading: resetLoading }] = useMutation<FactoryResetResponse>(FACTORY_RESET_SENSOR);
  const [getCalibrationStatus] = useMutation<GetCalibrationStatusResponse>(GET_SENSOR_CALIBRATION_STATUS);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleGetStatus = async (sensor: SensorCalibrationInfo) => {
    setStatusLoading(sensor.id);
    setStatusData(null);
    try {
      const { data } = await getCalibrationStatus({
        variables: { sensorId: parseInt(sensor.id) },
      });
      if (data?.getSensorCalibrationStatus.success && data.getSensorCalibrationStatus.status) {
        setStatusData(data.getSensorCalibrationStatus.status);
        setSelectedSensor(sensor);
      } else {
        showFeedback('error', data?.getSensorCalibrationStatus.message ?? 'Failed to get status');
      }
    } catch (err) {
      showFeedback('error', `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setStatusLoading(null);
    }
  };

  const handleFRC = async (referenceCo2: number) => {
    if (!selectedSensor) return;
    try {
      const { data } = await calibrateFRC({
        variables: { sensorId: parseInt(selectedSensor.id), referenceCo2 },
      });
      if (data?.calibrateSensorFrc.success) {
        const result = data.calibrateSensorFrc.result;
        showFeedback('success',
          `Calibration complete. Pre: ${result?.preCalibrationCo2 ?? '?'} ppm, Post: ${result?.postCalibrationCo2 ?? '?'} ppm, Correction: ${result?.correction ?? '?'}`
        );
        setShowFRCModal(false);
      } else {
        showFeedback('error', data?.calibrateSensorFrc.message ?? 'Calibration failed');
      }
    } catch (err) {
      showFeedback('error', `Calibration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleToggleASC = async (sensor: SensorCalibrationInfo, enabled: boolean) => {
    try {
      const { data } = await setSensorASC({
        variables: { sensorId: parseInt(sensor.id), enabled },
      });
      if (data?.setSensorAsc.success) {
        showFeedback('success', `Auto-calibration ${enabled ? 'enabled' : 'disabled'}`);
      } else {
        showFeedback('error', data?.setSensorAsc.message ?? 'Failed to toggle ASC');
      }
    } catch (err) {
      showFeedback('error', `Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleTempOffset = async (offset: number) => {
    if (!selectedSensor) return;
    try {
      const { data } = await setTempOffset({
        variables: { sensorId: parseInt(selectedSensor.id), offset },
      });
      if (data?.setSensorTemperatureOffset.success) {
        showFeedback('success', `Temperature offset set to ${offset}C`);
        setShowTempOffsetModal(false);
      } else {
        showFeedback('error', data?.setSensorTemperatureOffset.message ?? 'Failed to set offset');
      }
    } catch (err) {
      showFeedback('error', `Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleFactoryReset = async () => {
    if (!selectedSensor) return;
    try {
      const { data } = await factoryReset({
        variables: { sensorId: parseInt(selectedSensor.id) },
      });
      if (data?.factoryResetSensor.success) {
        showFeedback('success', 'Sensor reset to factory calibration defaults');
        setShowResetConfirm(false);
      } else {
        showFeedback('error', data?.factoryResetSensor.message ?? 'Factory reset failed');
      }
    } catch (err) {
      showFeedback('error', `Reset failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-airq-dark/60">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-sm">Loading sensors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-airq-tertiary/10 border border-airq-tertiary text-airq-tertiary text-sm">
        Failed to load sensors: {error.message}
      </div>
    );
  }

  const activeSensors = (sensors ?? []).filter((s: SensorCalibrationInfo) => s.isActive);

  return (
    <>
      {/* Header */}
      <div className="bg-airq-dark text-airq-light px-4 py-3 border-b border-black/80">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold">sensor calibration</p>
            <p className="text-xs text-airq-light/70">calibrate CO2 sensors and manage calibration settings</p>
          </div>
          <Crosshair className="w-4 h-4 text-airq-light/60" />
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`px-4 py-2 text-xs flex items-center ${
          feedback.type === 'success'
            ? 'bg-airq-primary/10 text-airq-primary border-b border-airq-primary/20'
            : 'bg-airq-tertiary/10 text-airq-tertiary border-b border-airq-tertiary/20'
        }`}>
          {feedback.type === 'success'
            ? <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0" />
            : <XCircle className="w-3 h-3 mr-2 flex-shrink-0" />
          }
          {feedback.message}
        </div>
      )}

      {/* Calibration Guide */}
      <div className="px-4 py-3 border-b border-airq-dark/20 bg-airq-contrast/5">
        <div className="flex items-start">
          <AlertTriangle className="w-4 h-4 text-airq-contrast mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-airq-dark/80 space-y-1">
            <p className="font-medium text-airq-dark">before calibrating:</p>
            <ol className="list-decimal ml-4 space-y-0.5">
              <li>place the sensor outdoors or near an open window for at least 3 minutes</li>
              <li>avoid breathing near the sensor during calibration</li>
              <li>the reference value for fresh outdoor air is ~420 ppm</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Sensor List */}
      {activeSensors.length === 0 ? (
        <div className="p-8 text-center text-airq-dark/50 text-sm">
          No active sensors found.
        </div>
      ) : (
        <div className="divide-y divide-airq-dark/20">
          {activeSensors.map((sensor: SensorCalibrationInfo) => (
            <div key={sensor.id} className="p-4">
              {/* Sensor Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Wind className="w-4 h-4 text-airq-dark/60 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-airq-dark">{sensor.name}</p>
                    <p className="text-xs text-airq-dark/50">{sensor.hostname}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGetStatus(sensor)}
                  disabled={statusLoading === sensor.id}
                  className="px-3 py-1.5 text-xs border border-airq-dark bg-airq-light text-airq-dark shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {statusLoading === sensor.id ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 mr-1" />
                  )}
                  check status
                </button>
              </div>

              {/* Calibration Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                <div className="bg-airq-dark/5 p-2 border border-airq-dark/10">
                  <div className="text-airq-dark/60 mb-1">last calibration</div>
                  <div className="font-medium text-airq-dark">
                    {sensor.lastCalibrationTime
                      ? new Date(sensor.lastCalibrationTime).toLocaleDateString()
                      : 'never'}
                  </div>
                </div>
                <div className="bg-airq-dark/5 p-2 border border-airq-dark/10">
                  <div className="text-airq-dark/60 mb-1">reference CO2</div>
                  <div className="font-medium text-airq-dark">
                    {sensor.lastCalibrationReferenceCo2
                      ? `${sensor.lastCalibrationReferenceCo2} ppm`
                      : '-'}
                  </div>
                </div>
                <div className="bg-airq-dark/5 p-2 border border-airq-dark/10">
                  <div className="text-airq-dark/60 mb-1">auto-calibration</div>
                  <div className={`font-medium ${sensor.autoCalibrationEnabled !== false ? 'text-airq-primary' : 'text-airq-dark/50'}`}>
                    {sensor.autoCalibrationEnabled !== false ? 'enabled' : 'disabled'}
                  </div>
                </div>
                <div className="bg-airq-dark/5 p-2 border border-airq-dark/10">
                  <div className="text-airq-dark/60 mb-1">temp offset</div>
                  <div className="font-medium text-airq-dark">
                    {sensor.temperatureOffset != null ? `${sensor.temperatureOffset}C` : '0C'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSelectedSensor(sensor); setShowFRCModal(true); }}
                  disabled={frcLoading}
                  className="px-3 py-1.5 text-xs border border-airq-dark shadow-card bg-airq-primary text-airq-light hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50 flex items-center"
                >
                  <Crosshair className="w-3 h-3 mr-1" />
                  calibrate CO2
                </button>
                <button
                  onClick={() => handleToggleASC(sensor, sensor.autoCalibrationEnabled === false)}
                  disabled={ascLoading}
                  className="px-3 py-1.5 text-xs border border-airq-dark bg-airq-light text-airq-dark shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50 flex items-center"
                >
                  {sensor.autoCalibrationEnabled !== false
                    ? <ToggleRight className="w-3 h-3 mr-1 text-airq-primary" />
                    : <ToggleLeft className="w-3 h-3 mr-1" />
                  }
                  {sensor.autoCalibrationEnabled !== false ? 'disable' : 'enable'} ASC
                </button>
                <button
                  onClick={() => { setSelectedSensor(sensor); setShowTempOffsetModal(true); }}
                  disabled={tempLoading}
                  className="px-3 py-1.5 text-xs border border-airq-dark bg-airq-light text-airq-dark shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50 flex items-center"
                >
                  <Thermometer className="w-3 h-3 mr-1" />
                  temp offset
                </button>
                <button
                  onClick={() => { setSelectedSensor(sensor); setShowResetConfirm(true); }}
                  disabled={resetLoading}
                  className="px-3 py-1.5 text-xs border border-airq-tertiary bg-airq-light text-airq-tertiary shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50 flex items-center"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  factory reset
                </button>
              </div>

              {/* Live Status Display (shown after status check) */}
              {selectedSensor?.id === sensor.id && statusData && (
                <div className="mt-3 border border-airq-dark/20">
                  <div className="bg-airq-dark/5 px-3 py-2 border-b border-airq-dark/20 flex items-center justify-between">
                    <span className="text-xs font-medium text-airq-dark">live sensor status</span>
                    <button onClick={() => setStatusData(null)} className="text-airq-dark/40 hover:text-airq-dark text-xs">dismiss</button>
                  </div>
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-airq-dark/60">CO2:</span>{' '}
                      <span className="font-medium">{statusData.currentCo2 ?? '-'} ppm</span>
                    </div>
                    <div>
                      <span className="text-airq-dark/60">Temperature:</span>{' '}
                      <span className="font-medium">{statusData.currentTemperature ?? '-'}C</span>
                    </div>
                    <div>
                      <span className="text-airq-dark/60">Humidity:</span>{' '}
                      <span className="font-medium">{statusData.currentHumidity ?? '-'}%</span>
                    </div>
                    <div>
                      <span className="text-airq-dark/60">ASC:</span>{' '}
                      <span className={`font-medium ${statusData.ascEnabled ? 'text-airq-primary' : 'text-airq-dark/50'}`}>
                        {statusData.ascEnabled ? 'enabled' : 'disabled'}
                      </span>
                    </div>
                    <div>
                      <span className="text-airq-dark/60">Temp Offset:</span>{' '}
                      <span className="font-medium">{statusData.temperatureOffset ?? 0}C</span>
                    </div>
                    <div>
                      <span className="text-airq-dark/60">Serial:</span>{' '}
                      <span className="font-medium font-mono text-[10px]">
                        {statusData.serialNumber?.join(':') ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FRC Calibration Modal */}
      <FRCModal
        isOpen={showFRCModal}
        onClose={() => setShowFRCModal(false)}
        onCalibrate={handleFRC}
        loading={frcLoading}
        sensorName={selectedSensor?.name ?? ''}
      />

      {/* Temperature Offset Modal */}
      <TempOffsetModal
        isOpen={showTempOffsetModal}
        onClose={() => setShowTempOffsetModal(false)}
        onSubmit={handleTempOffset}
        loading={tempLoading}
        currentOffset={selectedSensor?.temperatureOffset ?? 0}
        sensorName={selectedSensor?.name ?? ''}
      />

      {/* Factory Reset Confirmation */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Confirm Factory Reset"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-airq-tertiary/10 border border-airq-tertiary p-3 text-sm text-airq-tertiary">
            <p className="font-medium mb-1">This will reset ALL calibration data</p>
            <p className="text-xs">
              Auto-calibration, forced calibration corrections, and temperature offsets
              will be restored to factory defaults. This cannot be undone.
            </p>
          </div>
          <p className="text-sm text-airq-dark">
            Reset <span className="font-medium">{selectedSensor?.name}</span> to factory calibration?
          </p>
          <div className="flex justify-end space-x-3 pt-2 border-t border-airq-dark/20">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 text-xs border border-airq-dark bg-airq-light text-airq-dark shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
            >
              cancel
            </button>
            <button
              onClick={handleFactoryReset}
              disabled={resetLoading}
              className="px-3 py-1.5 text-xs border border-airq-tertiary bg-airq-tertiary text-airq-light shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50 flex items-center"
            >
              {resetLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              reset to factory defaults
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ---- Sub-components ----

interface FRCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrate: (referenceCo2: number) => void;
  loading: boolean;
  sensorName: string;
}

const FRCModal: React.FC<FRCModalProps> = ({ isOpen, onClose, onCalibrate, loading, sensorName }) => {
  const [referenceCo2, setReferenceCo2] = useState(420);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalibrate(referenceCo2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Forced Recalibration (FRC)" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-airq-contrast/5 border border-airq-contrast/20 p-3 text-xs text-airq-dark/80">
          <p className="font-medium text-airq-dark mb-1">How FRC works:</p>
          <ul className="list-disc ml-4 space-y-0.5">
            <li>The sensor must be exposed to a known CO2 concentration</li>
            <li>For fresh outdoor air, use 420 ppm as the reference</li>
            <li>The sensor will adjust its readings to match the reference</li>
            <li>Calibration is saved to the sensor&apos;s EEPROM (persists through power cycles)</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium text-airq-dark mb-1">
            sensor
          </label>
          <p className="text-sm text-airq-dark/70">{sensorName}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-airq-dark mb-1">
            reference CO2 (ppm) <span className="text-airq-tertiary">*</span>
          </label>
          <input
            type="number"
            value={referenceCo2}
            onChange={(e) => setReferenceCo2(parseInt(e.target.value) || 420)}
            min={300}
            max={2000}
            className="w-full px-3 py-2 border border-airq-dark bg-airq-light text-airq-dark text-sm focus:ring-1 focus:ring-airq-contrast focus:border-airq-contrast outline-none"
          />
          <p className="mt-1 text-xs text-airq-dark/50">
            Fresh outdoor air is approximately 420 ppm. Use a CO2 reference gas for precise calibration.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-airq-dark/20">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-airq-dark bg-airq-light text-airq-dark shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
          >
            cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 text-xs border border-airq-dark shadow-card bg-airq-primary text-airq-light hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50 flex items-center"
          >
            {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            calibrate sensor
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface TempOffsetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offset: number) => void;
  loading: boolean;
  currentOffset: number;
  sensorName: string;
}

const TempOffsetModal: React.FC<TempOffsetModalProps> = ({ isOpen, onClose, onSubmit, loading, currentOffset, sensorName }) => {
  const [offset, setOffset] = useState(currentOffset);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(offset);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Temperature Offset" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-airq-contrast/5 border border-airq-contrast/20 p-3 text-xs text-airq-dark/80">
          <p>
            If the sensor consistently reads temperature too high or too low (due to
            self-heating or enclosure effects), apply an offset to compensate.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-airq-dark mb-1">
            sensor
          </label>
          <p className="text-sm text-airq-dark/70">{sensorName}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-airq-dark mb-1">
            offset (C) <span className="text-airq-tertiary">*</span>
          </label>
          <input
            type="number"
            value={offset}
            onChange={(e) => setOffset(parseFloat(e.target.value) || 0)}
            step="0.1"
            min="-10"
            max="10"
            className="w-full px-3 py-2 border border-airq-dark bg-airq-light text-airq-dark text-sm focus:ring-1 focus:ring-airq-contrast focus:border-airq-contrast outline-none"
          />
          <p className="mt-1 text-xs text-airq-dark/50">
            Example: if sensor reads 2C too high, set offset to -2.0
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-airq-dark/20">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-airq-dark bg-airq-light text-airq-dark shadow-card hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
          >
            cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 text-xs border border-airq-dark shadow-card bg-airq-primary text-airq-light hover:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50 flex items-center"
          >
            {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            apply offset
          </button>
        </div>
      </form>
    </Modal>
  );
};
