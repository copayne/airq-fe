import React from 'react';
import { SettingsLayout } from '~/components/settings/SettingsLayout';
import { SensorList } from '~/components/settings/sensors/SensorList';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

const SensorsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Sensors"
        description="Manage sensor devices and their status"
      >
        <SensorList />
      </SettingsLayout>
    </ProtectedRoute>
  );
};

export default SensorsPage;
