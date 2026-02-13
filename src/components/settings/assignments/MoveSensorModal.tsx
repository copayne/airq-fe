import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { MOVE_SENSOR_TO_LOCATION } from '~/graphql/SensorLocation';
import { Modal } from '~/components/common/Modal';
import { ArrowRight } from 'lucide-react';

interface Sensor {
  id: number;
  name: string;
  hostname: string;
  currentLocation: {
    id: number;
    name: string;
  } | null;
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

interface MoveSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sensor: Sensor;
  locations: Location[];
}

export const MoveSensorModal: React.FC<MoveSensorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sensor,
  locations
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');
  const [errors, setErrors] = useState<string[]>([]);

  const [moveSensor, { loading }] = useMutation<{ moveSensorToLocation: SensorLocationPayload }>(MOVE_SENSOR_TO_LOCATION, {
    onCompleted: (data) => {
      if (data.moveSensorToLocation.success) {
        resetForm();
        onSuccess();
      } else {
        setErrors(data.moveSensorToLocation.errors ?? [data.moveSensorToLocation.message ?? 'Unknown error']);
      }
    },
    onError: (error) => {
      setErrors([error.message]);
    },
  });

  const resetForm = () => {
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

    if (!selectedLocationId) {
      setErrors(['Please select a new location']);
      return;
    }

    if (selectedLocationId === sensor.currentLocation?.id) {
      setErrors(['Sensor is already at this location']);
      return;
    }

    await moveSensor({
      variables: {
        input: {
          sensorId: sensor.id,
          newLocationId: selectedLocationId,
        },
      },
    });
  };

  // Filter out the current location from available options
  const availableLocations = locations.filter(
    (loc) => loc.id !== sensor.currentLocation?.id
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="move sensor">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="bg-airq-tertiary/10 border border-airq-tertiary p-3">
            {errors.map((error, i) => (
              <p key={i} className="text-sm text-airq-tertiary">{error}</p>
            ))}
          </div>
        )}

        {/* Current Assignment Info */}
        <div className="bg-airq-dark/5 border border-airq-dark/20 p-4">
          <p className="text-sm text-airq-dark/60 mb-2">moving sensor:</p>
          <div className="flex items-center space-x-3">
            <div>
              <p className="font-medium text-airq-dark">{sensor.name}</p>
              <p className="text-sm text-airq-dark/60">{sensor.hostname}</p>
            </div>
          </div>
          <div className="flex items-center mt-3 pt-3 border-t border-airq-dark/20">
            <div className="flex-1">
              <p className="text-xs text-airq-dark/50 mb-1">current location</p>
              <p className="text-sm font-medium text-airq-dark">
                {sensor.currentLocation?.name ?? 'Unassigned'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-airq-dark/40 mx-4" />
            <div className="flex-1">
              <p className="text-xs text-airq-dark/50 mb-1">new location</p>
              <p className="text-sm font-medium text-airq-contrast">
                {selectedLocationId
                  ? locations.find((l) => l.id === selectedLocationId)?.name
                  : 'select below...'}
              </p>
            </div>
          </div>
        </div>

        {availableLocations.length === 0 ? (
          <div className="bg-airq-secondary/10 border border-airq-secondary p-4">
            <p className="text-sm text-airq-dark">
              no other locations available. create a new location first.
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-airq-dark mb-1">
              new location <span className="text-airq-tertiary">*</span>
            </label>
            <select
              id="location"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3 py-2 border border-airq-dark bg-airq-light text-airq-dark text-sm focus:ring-1 focus:ring-airq-contrast focus:border-airq-contrast outline-none"
              disabled={loading}
            >
              <option value="">select a location...</option>
              {availableLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
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
            disabled={loading || availableLocations.length === 0}
            className="px-4 py-2 text-sm font-medium text-airq-light bg-airq-primary border border-airq-dark shadow-card hover:bg-airq-primary/90 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                moving...
              </span>
            ) : (
              'move sensor'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MoveSensorModal;
