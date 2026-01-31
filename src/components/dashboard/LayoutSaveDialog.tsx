import React, { useState, useEffect } from 'react';
import Modal from '~/components/common/Modal';

interface LayoutSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  existingNames: string[];
  isLoading?: boolean;
  mode?: 'save' | 'create' | 'rename' | 'duplicate';
  initialName?: string;
}

export const LayoutSaveDialog: React.FC<LayoutSaveDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  existingNames,
  isLoading = false,
  mode = 'save',
  initialName = '',
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Generate default name or use initial name
  useEffect(() => {
    if (isOpen) {
      if (mode === 'save' || mode === 'create') {
        const today = new Date().toISOString().split('T')[0];
        setName(`Dashboard - ${today}`);
      } else {
        setName(initialName);
      }
      setError(null);
    }
  }, [isOpen, mode, initialName]);

  const validateName = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Name is required';
    }
    if (trimmed.length > 100) {
      return 'Name cannot exceed 100 characters';
    }
    // For rename, allow keeping the same name
    if (mode !== 'rename' || trimmed !== initialName) {
      if (existingNames.includes(trimmed)) {
        return 'A layout with this name already exists';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onSave(name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const titles = {
    save: 'Save Layout',
    create: 'Create New Layout',
    rename: 'Rename Layout',
    duplicate: 'Duplicate Layout',
  };

  const buttonText = {
    save: 'Save',
    create: 'Create',
    rename: 'Rename',
    duplicate: 'Duplicate',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[mode]} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="layout-name"
            className="block text-sm font-medium text-airq-dark mb-1"
          >
            Layout Name
          </label>
          <input
            id="layout-name"
            type="text"
            value={name}
            onChange={handleChange}
            disabled={isLoading}
            autoFocus
            className={`w-full px-3 py-2 text-sm border ${
              error ? 'border-airq-tertiary' : 'border-airq-dark'
            } bg-white text-airq-dark focus:outline-none focus:ring-1 focus:ring-airq-primary disabled:opacity-50`}
            placeholder="Enter layout name..."
          />
          {error && (
            <p className="mt-1 text-xs text-airq-tertiary">{error}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-airq-dark bg-airq-light border border-airq-dark shadow-card hover:bg-airq-dark/5 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-airq-light bg-airq-primary border border-airq-dark shadow-card hover:bg-airq-primary/90 active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              buttonText[mode]
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LayoutSaveDialog;
