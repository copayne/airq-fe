import Head from 'next/head';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';
import Layout from '~/components/layout/Layout';
import { useAuth } from '~/context/AuthContext';

function ProfileContent() {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-status-bad/20 text-default-textDark border-status-bad';
      case 'user':
        return 'bg-default-contrast/20 text-default-textDark border-default-contrast';
      case 'viewer':
        return 'bg-default-light text-default-textDark border-default-dark';
      default:
        return 'bg-default-light text-default-textDark border-default-dark';
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="w-full shadow-card border border-default-dark">
          {/* Header */}
          <div className="bg-default-textLight text-default-textDark px-2 py-1 flex justify-between items-center border-b-[1px] border-default-dark">
            <p className="text-xs font-semibold w-full h-full align-baseline">profile</p>
          </div>

          {/* Profile Content */}
          <div className="bg-default-textLight px-8 py-6">
            <div className="flex items-start space-x-6">
              {/* User Info */}
              <div className="flex-1">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <h1 className="text-2xl">{user.fullName}</h1>
                  </div>

                  <div className="flex w-1/3 justify-between mb-2">
                    <div>
                      <label className="block text-sm font-medium text-default-textDark mb-1">
                        status
                      </label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-sm text-sm font-medium border shadow-card ${
                        user.isActive ? 'bg-status-good/20 text-default-textDark border-status-good' : 'bg-status-bad/20 text-default-textDark border-status-bad'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-default-textDark mb-1">
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
                    <label className="block text-sm font-medium text-default-textDark mb-1">
                      username
                    </label>
                    <p className="text-sm text-default-textDark bg-default-light px-3 py-2 rounded-sm border border-default-dark">
                      {user.username}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-default-textDark mb-1">
                      email
                    </label>
                    <p className="text-sm text-default-textDark bg-default-light px-3 py-2 rounded-sm border border-default-dark">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex w-full">
                    <div className="w-1/2 pr-2">
                      <label className="block text-sm font-medium text-default-textDark mb-1">
                        last login
                      </label>
                      <p className="text-sm text-default-textDark bg-default-light px-3 py-2 rounded-sm border border-default-dark">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div className="w-1/2 pl-2">
                      <label className="block text-sm font-medium text-default-textDark mb-1">
                        user since
                      </label>
                      <p className="text-sm text-default-textDark bg-default-light px-3 py-2 rounded-sm border border-default-dark">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="px-8 py-6 border-t border-default-dark bg-default-contrast">
            <div className="flex space-x-4 justify-end">
              <button
                disabled
                className="shadow-card py-2 px-3 border border-default-dark rounded-sm text-sm font-medium text-default-textDark bg-default-light cursor-not-allowed opacity-50"
              >
                Edit Profile (Coming Soon)
              </button>
              <button
                disabled
                className="shadow-card py-2 px-3 border border-default-dark rounded-sm text-sm font-medium text-default-textDark bg-default-light cursor-not-allowed opacity-50"
              >
                Change Password (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
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