import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_LOCATION, UPDATE_LOCATION } from '~/graphql/Location';

interface LocationPayload {
  location: { id: number; name: string; description: string | null } | null;
  success: boolean;
  message: string | null;
  errors: string[] | null;
}

interface LocationFormProps {
  location?: {
    id: number;
    name: string;
    description: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  location,
  onSuccess,
  onCancel
}) => {
  const isEditing = !!location;
  const [name, setName] = useState(location?.name ?? '');
  const [description, setDescription] = useState(location?.description ?? '');
  const [errors, setErrors] = useState<string[]>([]);

  const [createLocation, { loading: creating }] = useMutation<{ createLocation: LocationPayload }>(CREATE_LOCATION, {
    onCompleted: (data) => {
      if (data.createLocation.success) {
        onSuccess();
      } else {
        setErrors(data.createLocation.errors ?? [data.createLocation.message ?? 'Unknown error']);
      }
    },
    onError: (error) => {
      setErrors([error.message]);
    },
  });

  const [updateLocation, { loading: updating }] = useMutation<{ updateLocation: LocationPayload }>(UPDATE_LOCATION, {
    onCompleted: (data) => {
      if (data.updateLocation.success) {
        onSuccess();
      } else {
        setErrors(data.updateLocation.errors ?? [data.updateLocation.message ?? 'Unknown error']);
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

    if (name.length > 100) {
      setErrors(['Name cannot exceed 100 characters']);
      return;
    }

    if (description && description.length > 500) {
      setErrors(['Description cannot exceed 500 characters']);
      return;
    }

    if (isEditing) {
      await updateLocation({
        variables: {
          input: {
            id: location.id,
            name: name.trim(),
            description: description.trim() || null,
          },
        },
      });
    } else {
      await createLocation({
        variables: {
          input: {
            name: name.trim(),
            description: description.trim() || null,
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
          placeholder="e.g., Living Room, Office, Bedroom"
          maxLength={100}
          disabled={loading}
        />
        <p className="mt-1 text-xs text-airq-dark/50">{name.length}/100 characters</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-airq-dark mb-1">
          description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-airq-dark bg-airq-light text-airq-dark text-sm focus:ring-1 focus:ring-airq-contrast focus:border-airq-contrast outline-none"
          placeholder="Optional description of the location"
          maxLength={500}
          disabled={loading}
        />
        <p className="mt-1 text-xs text-airq-dark/50">{description.length}/500 characters</p>
      </div>

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
            isEditing ? 'save changes' : 'create location'
          )}
        </button>
      </div>
    </form>
  );
};

export default LocationForm;
