import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_SENSOR, UPDATE_SENSOR } from '~/graphql/Sensor';

interface SensorPayload {
  sensor: { id: number; name: string; hostname: string; isActive: boolean } | null;
  success: boolean;
  message: string | null;
  errors: string[] | null;
}

interface SensorFormProps {
  sensor?: {
    id: number;
    name: string;
    hostname: string;
    isActive: boolean;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export const SensorForm: React.FC<SensorFormProps> = ({
  sensor,
  onSuccess,
  onCancel
}) => {
  const isEditing = !!sensor;
  const [name, setName] = useState(sensor?.name ?? '');
  const [hostname, setHostname] = useState(sensor?.hostname ?? '');
  const [isActive, setIsActive] = useState(sensor?.isActive ?? true);
  const [errors, setErrors] = useState<string[]>([]);

  const [createSensor, { loading: creating }] = useMutation<{ createSensor: SensorPayload }>(CREATE_SENSOR, {
    onCompleted: (data) => {
      if (data.createSensor.success) {
        onSuccess();
      } else {
        setErrors(data.createSensor.errors ?? [data.createSensor.message ?? 'Unknown error']);
      }
    },
    onError: (error) => {
      setErrors([error.message]);
    },
  });

  const [updateSensor, { loading: updating }] = useMutation<{ updateSensor: SensorPayload }>(UPDATE_SENSOR, {
    onCompleted: (data) => {
      if (data.updateSensor.success) {
        onSuccess();
      } else {
        setErrors(data.updateSensor.errors ?? [data.updateSensor.message ?? 'Unknown error']);
      }
    },
    onError: (error) => {
      setErrors([error.message]);
    },
  });

  const loading = creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Client-side validation
    if (!name.trim()) {
      setErrors(['Name is required']);
      return;
    }

    if (!hostname.trim()) {
      setErrors(['Hostname is required']);
      return;
    }

    if (name.length > 100) {
      setErrors(['Name cannot exceed 100 characters']);
      return;
    }

    if (hostname.length > 100) {
      setErrors(['Hostname cannot exceed 100 characters']);
      return;
    }

    if (isEditing) {
      await updateSensor({
        variables: {
          input: {
            id: sensor.id,
            name: name.trim(),
            hostname: hostname.trim(),
            isActive,
          },
        },
      });
    } else {
      await createSensor({
        variables: {
          input: {
            name: name.trim(),
            hostname: hostname.trim(),
          },
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <div className="bg-airq-tertiary/10 border border-airq-tertiary p-3">
          {errors.map((error, i) => (
            <p key={i} className="text-sm text-airq-tertiary">{error}</p>
          ))}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-airq-dark mb-1">
          name <span className="text-airq-tertiary">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-airq-dark bg-airq-light text-airq-dark text-sm focus:ring-1 focus:ring-airq-contrast focus:border-airq-contrast outline-none"
          placeholder="e.g., Living Room Sensor, Office CO2 Monitor"
          maxLength={100}
          disabled={loading}
        />
        <p className="mt-1 text-xs text-airq-dark/50">{name.length}/100 characters</p>
      </div>

      <div>
        <label htmlFor="hostname" className="block text-sm font-medium text-airq-dark mb-1">
          hostname <span className="text-airq-tertiary">*</span>
        </label>
        <input
          type="text"
          id="hostname"
          value={hostname}
          onChange={(e) => setHostname(e.target.value)}
          className="w-full px-3 py-2 border border-airq-dark bg-airq-light text-airq-dark text-sm focus:ring-1 focus:ring-airq-contrast focus:border-airq-contrast outline-none"
          placeholder="e.g., airq-basement, airq-main-floor"
          maxLength={100}
          disabled={loading}
        />
        <p className="mt-1 text-xs text-airq-dark/50">{hostname.length}/100 characters</p>
      </div>

      {isEditing && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-airq-primary focus:ring-airq-primary border-airq-dark"
            disabled={loading}
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-airq-dark">
            sensor is active
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-airq-dark/20">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-airq-dark bg-airq-light border border-airq-dark shadow-card hover:bg-airq-dark/5 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50"
        >
          cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-airq-light bg-airq-primary border border-airq-dark shadow-card hover:bg-airq-primary/90 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isEditing ? 'saving...' : 'creating...'}
            </span>
          ) : (
            isEditing ? 'save changes' : 'create sensor'
          )}
        </button>
      </div>
    </form>
  );
};

export default SensorForm;
