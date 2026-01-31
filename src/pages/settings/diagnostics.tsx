import { SettingsLayout } from '~/components/settings/SettingsLayout';
import { DiagnosticsList } from '~/components/settings/diagnostics/DiagnosticsList';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

export default function DiagnosticsPage() {
  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Sensor Diagnostics"
        description="Monitor sensor health, run diagnostics, and troubleshoot issues"
      >
        <DiagnosticsList />
      </SettingsLayout>
    </ProtectedRoute>
  );
}
