import React, { useState } from 'react';
import { useChangePassword } from '~/hooks/useAuthMutations';
import { validatePassword } from '~/utils/authValidation';

interface ChangePasswordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess, onCancel }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { changePassword, loading } = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0] ?? 'Invalid password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const result = await changePassword({
      currentPassword,
      newPassword,
    });

    if (result?.success) {
      onSuccess();
    } else if (result && !result.success) {
      setError(result.message || 'Password change failed');
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
        <label className="block text-sm font-medium text-airq-dark mb-1">current password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-airq-dark rounded-sm bg-airq-light text-airq-dark focus:outline-none focus:ring-1 focus:ring-airq-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-airq-dark mb-1">new password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-airq-dark rounded-sm bg-airq-light text-airq-dark focus:outline-none focus:ring-1 focus:ring-airq-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-airq-dark mb-1">confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'changing...' : 'change password'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
