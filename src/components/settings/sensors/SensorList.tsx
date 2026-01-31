import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Edit2, Trash2, Cpu, Power, PowerOff } from 'lucide-react';
import { GET_SENSORS_BASIC, DELETE_SENSOR, TOGGLE_SENSOR_ACTIVE } from '~/graphql/Sensor';
import { SensorForm } from './SensorForm';
import { SensorStatusBadge } from './SensorStatusBadge';
import { ConfirmDialog } from '~/components/common/ConfirmDialog';
import { Modal } from '~/components/common/Modal';

interface Sensor {
  id: number;
  name: string;
  model: string;
  isActive: boolean;
  installationDate: string;
  currentLocation: {
    id: number;
    name: string;
  } | null;
}

interface DeletePayload {
  success: boolean;
  message: string | null;
  errors: string[] | null;
}

export const SensorList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [deletingSensor, setDeletingSensor] = useState<Sensor | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data, loading, error, refetch } = useQuery<{ sensors: Sensor[] }>(GET_SENSORS_BASIC);

  const [deleteSensor, { loading: deleting }] = useMutation<{ deleteSensor: DeletePayload }>(DELETE_SENSOR, {
    onCompleted: (data) => {
      if (data.deleteSensor.success) {
        setDeletingSensor(null);
        void refetch();
      }
    },
  });

  const [toggleSensorActive] = useMutation(TOGGLE_SENSOR_ACTIVE, {
    onCompleted: () => {
      void refetch();
    },
  });

  const handleDelete = async () => {
    if (!deletingSensor) return;
    await deleteSensor({ variables: { id: deletingSensor.id } });
  };

  const handleToggleActive = (sensor: Sensor) => {
    void toggleSensorActive({
      variables: { id: sensor.id, isActive: !sensor.isActive },
    });
  };

  const handleSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingSensor(null);
    void refetch();
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-airq-tertiary/10 border border-airq-tertiary p-4">
          <p className="text-sm text-airq-tertiary">Failed to load sensors: {error.message}</p>
        </div>
      </div>
    );
  }

  const allSensors = data?.sensors ?? [];
  const sensors = allSensors.filter((s) => {
    if (filter === 'active') return s.isActive;
    if (filter === 'inactive') return !s.isActive;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="bg-airq-dark text-airq-light px-4 py-3 border-b border-black/80">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">sensors</h2>
            <p className="text-xs text-airq-light/70">manage sensor devices and their status</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 bg-airq-primary text-airq-light text-xs font-medium border border-airq-dark shadow-card hover:bg-airq-primary/90 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            add sensor
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-xs border transition-colors ${
                filter === f
                  ? 'bg-airq-light text-airq-dark border-airq-light'
                  : 'bg-transparent text-airq-light/70 border-airq-light/30 hover:border-airq-light/60'
              }`}
            >
              {f}
              {f === 'all' && ` (${allSensors.length})`}
              {f === 'active' && ` (${allSensors.filter((s) => s.isActive).length})`}
              {f === 'inactive' && ` (${allSensors.filter((s) => !s.isActive).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-airq-dark/10">
        {sensors.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto bg-airq-primary/10 border border-airq-dark flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-airq-primary" />
            </div>
            <h3 className="text-sm font-medium text-airq-dark mb-1">
              {filter === 'all' ? 'no sensors yet' : `no ${filter} sensors`}
            </h3>
            <p className="text-sm text-airq-dark/60 mb-4">
              {filter === 'all'
                ? 'get started by adding your first sensor.'
                : 'no sensors match the current filter.'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-airq-primary text-airq-light text-sm font-medium border border-airq-dark shadow-card hover:bg-airq-primary/90 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                add sensor
              </button>
            )}
          </div>
        ) : (
          sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="px-4 py-4 flex items-center justify-between hover:bg-airq-dark/5 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-10 h-10 border border-airq-dark flex items-center justify-center ${
                    sensor.isActive ? 'bg-airq-primary/10' : 'bg-airq-dark/5'
                  }`}>
                    <Cpu className={`w-5 h-5 ${sensor.isActive ? 'text-airq-primary' : 'text-airq-dark/40'}`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-airq-dark">{sensor.name}</h3>
                      <SensorStatusBadge isActive={sensor.isActive} />
                    </div>
                    <p className="text-sm text-airq-dark/60">{sensor.model}</p>
                    <p className="text-xs text-airq-dark/50 mt-1">
                      {sensor.currentLocation
                        ? `Located at: ${sensor.currentLocation.name}`
                        : 'Unassigned'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleToggleActive(sensor)}
                  className={`p-2 transition-colors ${
                    sensor.isActive
                      ? 'text-airq-primary hover:bg-airq-primary/10'
                      : 'text-airq-dark/40 hover:bg-airq-dark/5'
                  }`}
                  title={sensor.isActive ? 'Deactivate sensor' : 'Activate sensor'}
                >
                  {sensor.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setEditingSensor(sensor)}
                  className="p-2 text-airq-dark/50 hover:text-airq-contrast hover:bg-airq-contrast/10 transition-colors"
                  title="Edit sensor"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingSensor(sensor)}
                  className="p-2 text-airq-dark/50 hover:text-airq-tertiary hover:bg-airq-tertiary/10 transition-colors"
                  title="Delete sensor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Sensor"
      >
        <SensorForm
          onSuccess={handleSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSensor}
        onClose={() => setEditingSensor(null)}
        title="Edit Sensor"
      >
        {editingSensor && (
          <SensorForm
            sensor={editingSensor}
            onSuccess={handleSuccess}
            onCancel={() => setEditingSensor(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingSensor}
        onClose={() => setDeletingSensor(null)}
        onConfirm={handleDelete}
        title="Delete Sensor"
        message={`Are you sure you want to delete "${deletingSensor?.name}"? Sensors with readings cannot be deleted - they can only be deactivated.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default SensorList;
