import React from 'react';
import { SettingsLayout } from '~/components/settings/SettingsLayout';
import { AlertSettings } from '~/components/settings/alerts/AlertSettings';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

const AlertsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Alerts"
        description="Configure CO2 threshold alerts and notification channels"
      >
        <AlertSettings />
      </SettingsLayout>
    </ProtectedRoute>
  );
};

export default AlertsPage;
