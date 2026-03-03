import React from 'react';
import { SettingsLayout } from '~/components/settings/SettingsLayout';
import { RingIntegrationSettings } from '~/components/settings/integrations/RingIntegrationSettings';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

const IntegrationsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Integrations"
        description="Manage external service connections"
      >
        <RingIntegrationSettings />
      </SettingsLayout>
    </ProtectedRoute>
  );
};

export default IntegrationsPage;
