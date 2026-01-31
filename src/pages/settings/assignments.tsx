import React from 'react';
import { SettingsLayout } from '~/components/settings/SettingsLayout';
import { AssignmentList } from '~/components/settings/assignments/AssignmentList';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

const AssignmentsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Sensor Assignments"
        description="Manage which sensors are assigned to which locations"
      >
        <AssignmentList />
      </SettingsLayout>
    </ProtectedRoute>
  );
};

export default AssignmentsPage;
