import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ASSIGN_SENSOR_TO_LOCATION } from '~/graphql/SensorLocation';
import { Modal } from '~/components/common/Modal';

interface Sensor {
  id: number;
  name: string;
  model: string;
}

interface Location {
  id: number;
  name: string;
}

interface SensorLocationPayload {
  sensorLocation: {
    id: number;
    startTime: string;
    isCurrent: boolean;
    sensor: { id: number; name: string };
    location: { id: number; name: string };
  } | null;
  success: boolean;
  message: string | null;
  errors: string[] | null;
}

interface AssignSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  unassignedSensors: Sensor[];
  locations: Location[];
}

export const AssignSensorModal: React.FC<AssignSensorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  unassignedSensors,
  locations
}) => {
  const [selectedSensorId, setSelectedSensorId] = useState<number | ''>('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');
  const [errors, setErrors] = useState<string[]>([]);

  const [assignSensor, { loading }] = useMutation<{ assignSensorToLocation: SensorLocationPayload }>(ASSIGN_SENSOR_TO_LOCATION, {
    onCompleted: (data) => {
      if (data.assignSensorToLocation.success) {
        resetForm();
        onSuccess();
      } else {
        setErrors(data.assignSensorToLocation.errors ?? [data.assignSensorToLocation.message ?? 'Unknown error']);
      }
    },
    onError: (error) => {
      setErrors([error.message]);
    },
  });

  const resetForm = () => {
    setSelectedSensorId('');
    setSelectedLocationId('');
    setErrors([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!selectedSensorId) {
      setErrors(['Please select a sensor']);
      return;
    }

    if (!selectedLocationId) {
      setErrors(['Please select a location']);
      return;
    }

    await assignSensor({
      variables: {
        input: {
          sensorId: selectedSensorId,
          locationId: selectedLocationId,
        },
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="assign sensor to location">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="bg-airq-tertiary/10 border border-airq-tertiary p-3">
            {errors.map((error, i) => (
              <p key={i} className="text-sm text-airq-tertiary">{error}</p>
            ))}
          </div>
        )}

        {unassignedSensors.length === 0 ? (
          <div className="bg-airq-secondary/10 border border-airq-secondary p-4">
            <p className="text-sm text-airq-dark">
              all active sensors are already assigned to locations. create a new sensor or deactivate an existing assignment first.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="sensor" className="block text-sm font-medium text-airq-dark mb-1">
                sensor <span className="text-airq-tertiary">*</span>
              </label>
              <select
                id="sensor"
                value={selectedSensorId}
                onChange={(e) => setSelectedSensorId(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 border border-airq-dark bg-airq-light text-airq-dark text-sm focus:ring-1 focus:ring-airq-contrast focus:border-airq-contrast outline-none"
                disabled={loading}
              >
                <option value="">select a sensor...</option>
                {unassignedSensors.map((sensor) => (
                  <option key={sensor.id} value={sensor.id}>
                    {sensor.name} ({sensor.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-airq-dark mb-1">
                location <span className="text-airq-tertiary">*</span>
              </label>
              <select
                id="location"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 border border-airq-dark bg-airq-light text-airq-dark text-sm focus:ring-1 focus:ring-airq-contrast focus:border-airq-contrast outline-none"
                disabled={loading}
              >
                <option value="">select a location...</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-airq-dark/20">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-airq-dark bg-airq-light border border-airq-dark shadow-card hover:bg-airq-dark/5 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50"
          >
            cancel
          </button>
          <button
            type="submit"
            disabled={loading || unassignedSensors.length === 0}
            className="px-4 py-2 text-sm font-medium text-airq-light bg-airq-primary border border-airq-dark shadow-card hover:bg-airq-primary/90 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                assigning...
              </span>
            ) : (
              'assign sensor'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignSensorModal;
