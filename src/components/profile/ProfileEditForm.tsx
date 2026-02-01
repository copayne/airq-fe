import React, { useState } from 'react';
import type { User } from '~/types/auth';
import { useUpdateProfile } from '~/hooks/useAuthMutations';
import { validateEmail } from '~/utils/authValidation';

interface ProfileEditFormProps {
  user: User;
  onSuccess: (updatedUser: User) => void;
  onCancel: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onSuccess, onCancel }) => {
  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState<string | null>(null);
  const { updateProfile, loading } = useUpdateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (firstName.trim().length > 100) {
      setError('First name must be no more than 100 characters');
      return;
    }
    if (lastName.trim().length > 100) {
      setError('Last name must be no more than 100 characters');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    const result = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    });

    if (result?.success && result.user) {
      onSuccess(result.user);
    } else if (result && !result.success) {
      setError(result.message || 'Profile update failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-airq-tertiary/20 border border-airq-tertiary text-airq-dark px-3 py-2 text-sm rounded-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-airq-dark mb-1">first name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-airq-dark rounded-sm bg-airq-light text-airq-dark focus:outline-none focus:ring-1 focus:ring-airq-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-airq-dark mb-1">last name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-airq-dark rounded-sm bg-airq-light text-airq-dark focus:outline-none focus:ring-1 focus:ring-airq-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-airq-dark mb-1">email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-airq-dark rounded-sm bg-airq-light text-airq-dark focus:outline-none focus:ring-1 focus:ring-airq-primary"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm border border-airq-dark rounded-sm bg-airq-light text-airq-dark shadow-card hover:bg-airq-dark/5"
        >
          cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm border border-airq-dark rounded-sm bg-airq-primary text-airq-light shadow-card hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'saving...' : 'save'}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
