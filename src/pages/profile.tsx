import Head from 'next/head';
import { useState } from 'react';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';
import { Modal } from '~/components/common/Modal';
import { useToast } from '~/components/common/Toast';
import Layout from '~/components/layout/Layout';
import { ProfileEditForm } from '~/components/profile/ProfileEditForm';
import { ChangePasswordForm } from '~/components/profile/ChangePasswordForm';
import { useAuth } from '~/context/AuthContext';
import type { User } from '~/types/auth';

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-airq-secondary text-airq-dark border-airq-dark';
      case 'user':
        return 'bg-airq-contrast text-airq-dark border-airq-dark';
      case 'viewer':
        return 'bg-airq-light text-airq-dark border-airq-dark';
      default:
        return 'bg-airq-light text-airq-dark border-airq-dark';
    }
  };

  const handleProfileEditSuccess = (updatedUser: User) => {
    updateUser(updatedUser);
    setIsEditModalOpen(false);
    showToast('success', 'Profile updated successfully');
  };

  const handlePasswordChangeSuccess = () => {
    setIsPasswordModalOpen(false);
    showToast('success', 'Password changed successfully');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="w-full shadow-card border border-airq-dark">
          {/* Header */}
          <div className="bg-airq-light text-airq-dark px-2 py-1 flex justify-between items-center border-b-[1px] border-airq-dark">
            <p className="text-xs font-semibold w-full h-full align-baseline">profile</p>
          </div>

          {/* Profile Content */}
          <div className="bg-airq-light px-8 py-6">
            <div className="flex items-start space-x-6">
              {/* User Info */}
              <div className="flex-1">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-2xl">{user.fullName}</p>
                  </div>

                  <div className="flex w-full mb-2">
                    <div className="mr-8">
                      <label className="block text-sm font-medium text-airq-dark mb-1">
                        status
                      </label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-sm text-sm font-medium border shadow-card ${
                        user.isActive ? 'bg-airq-primary text-airq-light border-airq-dark' : 'bg-airq-tertiary text-airq-dark'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-airq-dark mb-1">
                        role
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-sm text-sm font-medium border shadow-card ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-airq-dark mb-1">
                      username
                    </label>
                    <p className="text-sm text-airq-dark bg-airq-light px-3 py-2 rounded-sm border border-airq-dark">
                      {user.username}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-airq-dark mb-1">
                      email
                    </label>
                    <p className="text-sm text-airq-dark bg-airq-light px-3 py-2 rounded-sm border border-airq-dark">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex w-full">
                    <div className="w-1/2 pr-2">
                      <label className="block text-sm font-medium text-airq-dark mb-1">
                        last login
                      </label>
                      <p className="text-sm text-airq-dark bg-airq-light px-3 py-2 rounded-sm border border-airq-dark">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div className="w-1/2 pl-2">
                      <label className="block text-sm font-medium text-airq-dark mb-1">
                        user since
                      </label>
                      <p className="text-sm text-airq-dark bg-airq-light px-3 py-2 rounded-sm border border-airq-dark">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="px-8 py-6 border-t border-airq-dark bg-airq-light">
            <div className="flex space-x-4 justify-between">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-16 shadow-card py-2 px-3 border border-airq-dark rounded-sm text-sm font-medium text-airq-light bg-airq-contrast"
              >
                edit
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-40 shadow-card py-2 px-3 border border-airq-dark rounded-sm text-sm font-medium text-airq-light bg-airq-primary"
              >
                change password
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="edit profile" size="sm">
        <ProfileEditForm
          user={user}
          onSuccess={handleProfileEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="change password" size="sm">
        <ChangePasswordForm
          onSuccess={handlePasswordChangeSuccess}
          onCancel={() => setIsPasswordModalOpen(false)}
        />
      </Modal>
    </Layout>
  );
}

export default function ProfilePage() {
  return (
    <>
      <Head>
        <title>Profile - Air Quality Dashboard</title>
        <meta name="description" content="Manage your profile settings" />
      </Head>
      <ProtectedRoute requiredRole="viewer">
        <ProfileContent />
      </ProtectedRoute>
    </>
  );
}
