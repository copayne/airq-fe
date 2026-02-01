import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPSERT_ALERT_THRESHOLD } from '~/graphql/Alerts';

interface AlertThreshold {
  id: string;
  sensorId: number | null;
  warningPpm: number;
  criticalPpm: number;
  cooldownMinutes: number;
  isEnabled: boolean;
}

interface Sensor {
  id: number;
  name: string;
}

interface AlertThresholdFormProps {
  threshold?: AlertThreshold | null;
  sensors: Sensor[];
  onSaved: () => void;
  onCancel: () => void;
}

export const AlertThresholdForm: React.FC<AlertThresholdFormProps> = ({
  threshold,
  sensors,
  onSaved,
  onCancel,
}) => {
  const [sensorId, setSensorId] = useState<number | null>(threshold?.sensorId ?? null);
  const [warningPpm, setWarningPpm] = useState(threshold?.warningPpm ?? 1000);
  const [criticalPpm, setCriticalPpm] = useState(threshold?.criticalPpm ?? 1500);
  const [cooldownMinutes, setCooldownMinutes] = useState(threshold?.cooldownMinutes ?? 30);
  const [isEnabled, setIsEnabled] = useState(threshold?.isEnabled ?? true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (threshold) {
      setSensorId(threshold.sensorId);
      setWarningPpm(threshold.warningPpm);
      setCriticalPpm(threshold.criticalPpm);
      setCooldownMinutes(threshold.cooldownMinutes);
      setIsEnabled(threshold.isEnabled);
    }
  }, [threshold]);

  const [upsertThreshold, { loading }] = useMutation<{
    upsertAlertThreshold: { success: boolean; message: string | null; errors: string[] };
  }>(UPSERT_ALERT_THRESHOLD, {
    onCompleted: (result) => {
      if (result.upsertAlertThreshold.success) {
        onSaved();
      } else {
        setFormError(result.upsertAlertThreshold.message ?? 'Failed to save');
      }
    },
    onError: (err) => setFormError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (warningPpm >= criticalPpm) {
      setFormError('Warning PPM must be less than critical PPM');
      return;
    }

    void upsertThreshold({
      variables: {
        input: {
          sensorId: sensorId ?? null,
          warningPpm,
          criticalPpm,
          cooldownMinutes,
          isEnabled,
        },
      },
    });
  };

  const inputClass = 'w-full px-3 py-2 border border-airq-dark/30 bg-white text-sm focus:outline-none focus:border-airq-contrast';
  const labelClass = 'block text-sm font-medium text-airq-dark mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {formError && (
        <div className="bg-airq-tertiary/10 border border-airq-tertiary text-airq-tertiary text-sm px-3 py-2">
          {formError}
        </div>
      )}

      <div>
        <label className={labelClass}>sensor</label>
        <select
          value={sensorId ?? ''}
          onChange={(e) => setSensorId(e.target.value ? Number(e.target.value) : null)}
          className={inputClass}
        >
          <option value="">Global (all sensors)</option>
          {sensors.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>warning PPM</label>
          <input
            type="number"
            value={warningPpm}
            onChange={(e) => setWarningPpm(Number(e.target.value))}
            min={0}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>critical PPM</label>
          <input
            type="number"
            value={criticalPpm}
            onChange={(e) => setCriticalPpm(Number(e.target.value))}
            min={0}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>cooldown (minutes)</label>
        <input
          type="number"
          value={cooldownMinutes}
          onChange={(e) => setCooldownMinutes(Number(e.target.value))}
          min={1}
          className={inputClass}
        />
      </div>

      <label className="flex items-center space-x-2 text-sm">
        <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} className="accent-airq-contrast" />
        <span>Enabled</span>
      </label>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-airq-dark/30 text-airq-dark hover:bg-airq-dark/5 transition-colors"
        >
          cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm bg-airq-contrast text-white hover:bg-airq-contrast/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'saving...' : 'save threshold'}
        </button>
      </div>
    </form>
  );
};
