import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowRightLeft, Plus, MapPin, Cpu, X } from 'lucide-react';
import { GET_SENSORS_BASIC } from '~/graphql/Sensor';
import { GET_LOCATIONS } from '~/graphql/Location';
import { REMOVE_SENSOR_FROM_LOCATION } from '~/graphql/SensorLocation';
import { AssignSensorModal } from './AssignSensorModal';
import { MoveSensorModal } from './MoveSensorModal';
import { ConfirmDialog } from '~/components/common/ConfirmDialog';

interface Sensor {
  id: number;
  name: string;
  model: string;
  isActive: boolean;
  currentLocation: {
    id: number;
    name: string;
  } | null;
}

interface Location {
  id: number;
  name: string;
  description: string | null;
}

interface SensorLocationPayload {
  sensorLocation: { id: number; endTime: string | null; isCurrent: boolean } | null;
  success: boolean;
  message: string | null;
  errors: string[] | null;
}

export const AssignmentList: React.FC = () => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [movingSensor, setMovingSensor] = useState<Sensor | null>(null);
  const [removingSensor, setRemovingSensor] = useState<Sensor | null>(null);

  const { data: sensorsData, loading: loadingSensors, refetch: refetchSensors } = useQuery<{ sensors: Sensor[] }>(GET_SENSORS_BASIC);
  const { data: locationsData, loading: loadingLocations, refetch: refetchLocations } = useQuery<{ locations: Location[] }>(GET_LOCATIONS);

  const [removeSensor, { loading: removing }] = useMutation<{ removeSensorFromLocation: SensorLocationPayload }>(REMOVE_SENSOR_FROM_LOCATION, {
    onCompleted: (data) => {
      if (data.removeSensorFromLocation.success) {
        setRemovingSensor(null);
        void refetchSensors();
      }
    },
  });

  const handleRemove = async () => {
    if (!removingSensor) return;
    await removeSensor({ variables: { sensorId: removingSensor.id } });
  };

  const handleSuccess = () => {
    setIsAssignModalOpen(false);
    setMovingSensor(null);
    void refetchSensors();
    void refetchLocations();
  };

  if (loadingSensors || loadingLocations) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-airq-dark/10 w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-airq-dark/5"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sensors = sensorsData?.sensors ?? [];
  const locations = locationsData?.locations ?? [];

  const assignedSensors = sensors.filter((s) => s.currentLocation && s.isActive);
  const unassignedSensors = sensors.filter((s) => !s.currentLocation && s.isActive);

  return (
    <div>
      {/* Header */}
      <div className="bg-airq-dark text-airq-light px-4 py-3 flex items-center justify-between border-b border-black/80">
        <div>
          <h2 className="text-sm font-semibold">sensor assignments</h2>
          <p className="text-xs text-airq-light/70">manage which sensors are assigned to which locations</p>
        </div>
        <button
          onClick={() => setIsAssignModalOpen(true)}
          disabled={unassignedSensors.length === 0}
          className="inline-flex items-center px-3 py-1.5 bg-airq-primary text-airq-light text-xs font-medium border border-airq-dark shadow-card hover:bg-airq-primary/90 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          assign sensor
        </button>
      </div>

      {/* Unassigned Sensors Alert */}
      {unassignedSensors.length > 0 && (
        <div className="px-4 py-3 bg-airq-secondary/10 border-b border-airq-secondary/30">
          <div className="flex items-center">
            <Cpu className="w-5 h-5 text-airq-secondary mr-2" />
            <p className="text-sm text-airq-dark">
              <span className="font-medium">{unassignedSensors.length} unassigned sensor{unassignedSensors.length !== 1 ? 's' : ''}</span>
              {' '}not collecting location-specific data.{' '}
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="font-medium underline text-airq-contrast hover:text-airq-contrast/80"
              >
                assign now
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Assigned Sensors */}
      <div className="divide-y divide-airq-dark/10">
        {assignedSensors.length === 0 && unassignedSensors.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto bg-airq-contrast/10 border border-airq-dark flex items-center justify-center mb-4">
              <ArrowRightLeft className="w-6 h-6 text-airq-contrast" />
            </div>
            <h3 className="text-sm font-medium text-airq-dark mb-1">no active sensors</h3>
            <p className="text-sm text-airq-dark/60">create and activate sensors to assign them to locations.</p>
          </div>
        ) : assignedSensors.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto bg-airq-contrast/10 border border-airq-dark flex items-center justify-center mb-4">
              <ArrowRightLeft className="w-6 h-6 text-airq-contrast" />
            </div>
            <h3 className="text-sm font-medium text-airq-dark mb-1">no assigned sensors</h3>
            <p className="text-sm text-airq-dark/60 mb-4">
              you have {unassignedSensors.length} unassigned sensor{unassignedSensors.length !== 1 ? 's' : ''}.
            </p>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-airq-primary text-airq-light text-sm font-medium border border-airq-dark shadow-card hover:bg-airq-primary/90 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              assign sensor
            </button>
          </div>
        ) : (
          assignedSensors.map((sensor) => (
            <div
              key={sensor.id}
              className="px-4 py-4 flex items-center justify-between hover:bg-airq-dark/5 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* Sensor */}
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-airq-primary/10 border border-airq-dark flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-airq-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-airq-dark">{sensor.name}</h3>
                    <p className="text-xs text-airq-dark/60">{sensor.model}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <ArrowRightLeft className="w-5 h-5 text-airq-dark/40" />
                </div>

                {/* Location */}
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-airq-contrast/10 border border-airq-dark flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-airq-contrast" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-airq-dark">{sensor.currentLocation?.name}</h3>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setMovingSensor(sensor)}
                  className="px-3 py-1.5 text-xs font-medium text-airq-contrast hover:bg-airq-contrast/10 transition-colors"
                >
                  move
                </button>
                <button
                  onClick={() => setRemovingSensor(sensor)}
                  className="p-2 text-airq-dark/50 hover:text-airq-tertiary hover:bg-airq-tertiary/10 transition-colors"
                  title="Remove assignment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Modal */}
      <AssignSensorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={handleSuccess}
        unassignedSensors={unassignedSensors}
        locations={locations}
      />

      {/* Move Modal */}
      {movingSensor && (
        <MoveSensorModal
          isOpen={!!movingSensor}
          onClose={() => setMovingSensor(null)}
          onSuccess={handleSuccess}
          sensor={movingSensor}
          locations={locations}
        />
      )}

      {/* Remove Confirmation */}
      <ConfirmDialog
        isOpen={!!removingSensor}
        onClose={() => setRemovingSensor(null)}
        onConfirm={handleRemove}
        title="Remove Assignment"
        message={`Are you sure you want to remove "${removingSensor?.name}" from "${removingSensor?.currentLocation?.name}"? The sensor will become unassigned.`}
        confirmText="Remove"
        variant="warning"
        isLoading={removing}
      />
    </div>
  );
};

export default AssignmentList;
