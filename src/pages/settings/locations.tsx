import React from 'react';
import { SettingsLayout } from '~/components/settings/SettingsLayout';
import { LocationList } from '~/components/settings/locations/LocationList';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

const LocationsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Locations"
        description="Manage physical locations where sensors are placed"
      >
        <LocationList />
      </SettingsLayout>
    </ProtectedRoute>
  );
};

export default LocationsPage;
