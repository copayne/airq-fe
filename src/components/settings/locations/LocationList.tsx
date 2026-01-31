import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { GET_LOCATIONS, DELETE_LOCATION } from '~/graphql/Location';
import { LocationForm } from './LocationForm';
import { ConfirmDialog } from '~/components/common/ConfirmDialog';
import { Modal } from '~/components/common/Modal';

interface Location {
  id: number;
  name: string;
  description: string | null;
  currentSensors: Array<{
    id: number;
    name: string;
    isActive: boolean;
  }>;
}

interface DeletePayload {
  success: boolean;
  message: string | null;
  errors: string[] | null;
}

export const LocationList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

  const { data, loading, error, refetch } = useQuery<{ locations: Location[] }>(GET_LOCATIONS);

  const [deleteLocation, { loading: deleting }] = useMutation<{ deleteLocation: DeletePayload }>(DELETE_LOCATION, {
    onCompleted: (data) => {
      if (data.deleteLocation.success) {
        setDeletingLocation(null);
        void refetch();
      }
    },
  });

  const handleDelete = async () => {
    if (!deletingLocation) return;
    await deleteLocation({ variables: { id: deletingLocation.id } });
  };

  const handleSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingLocation(null);
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
          <p className="text-sm text-airq-tertiary">Failed to load locations: {error.message}</p>
        </div>
      </div>
    );
  }

  const locations = data?.locations ?? [];

  return (
    <div>
      {/* Header */}
      <div className="bg-airq-dark text-airq-light px-4 py-3 flex items-center justify-between border-b border-black/80">
        <div>
          <h2 className="text-sm font-semibold">locations</h2>
          <p className="text-xs text-airq-light/70">manage physical locations where sensors are placed</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-3 py-1.5 bg-airq-primary text-airq-light text-xs font-medium border border-airq-dark shadow-card hover:bg-airq-primary/90 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          add location
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-airq-dark/10">
        {locations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto bg-airq-contrast/10 border border-airq-dark flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-airq-contrast" />
            </div>
            <h3 className="text-sm font-medium text-airq-dark mb-1">no locations yet</h3>
            <p className="text-sm text-airq-dark/60 mb-4">get started by creating your first location.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-airq-primary text-airq-light text-sm font-medium border border-airq-dark shadow-card hover:bg-airq-primary/90 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              add location
            </button>
          </div>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className="px-4 py-4 flex items-center justify-between hover:bg-airq-dark/5 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-airq-contrast/10 border border-airq-dark flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-airq-contrast" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-airq-dark">{location.name}</h3>
                    {location.description && (
                      <p className="text-sm text-airq-dark/60 truncate max-w-md">{location.description}</p>
                    )}
                    {location.currentSensors.length > 0 && (
                      <p className="text-xs text-airq-dark/50 mt-1">
                        {location.currentSensors.length} sensor{location.currentSensors.length !== 1 ? 's' : ''} assigned
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setEditingLocation(location)}
                  className="p-2 text-airq-dark/50 hover:text-airq-contrast hover:bg-airq-contrast/10 transition-colors"
                  title="Edit location"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingLocation(location)}
                  className="p-2 text-airq-dark/50 hover:text-airq-tertiary hover:bg-airq-tertiary/10 transition-colors"
                  title="Delete location"
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
        title="Add Location"
      >
        <LocationForm
          onSuccess={handleSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingLocation}
        onClose={() => setEditingLocation(null)}
        title="Edit Location"
      >
        {editingLocation && (
          <LocationForm
            location={editingLocation}
            onSuccess={handleSuccess}
            onCancel={() => setEditingLocation(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingLocation}
        onClose={() => setDeletingLocation(null)}
        onConfirm={handleDelete}
        title="Delete Location"
        message={
          deletingLocation?.currentSensors.length
            ? `This location has ${deletingLocation.currentSensors.length} sensor(s) assigned. You must reassign or remove them before deleting.`
            : `Are you sure you want to delete "${deletingLocation?.name}"? This action cannot be undone.`
        }
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default LocationList;
