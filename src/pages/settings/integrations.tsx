import React from 'react';
import { SettingsLayout } from '~/components/settings/SettingsLayout';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

const IntegrationsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Integrations"
        description="Manage external service connections"
      >
        <div className="px-4 py-8 text-center text-airq-dark/50 text-sm">
          No integrations configured. Ring integration has moved to Hudson Security.
        </div>
      </SettingsLayout>
    </ProtectedRoute>
  );
};

export default IntegrationsPage;
