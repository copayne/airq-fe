import { SettingsLayout } from '~/components/settings/SettingsLayout';
import { CalibrationPanel } from '~/components/settings/calibration/CalibrationPanel';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

export default function CalibrationPage() {
  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Sensor Calibration"
        description="Calibrate CO2 sensors, manage auto-calibration, and adjust temperature offsets"
      >
        <CalibrationPanel />
      </SettingsLayout>
    </ProtectedRoute>
  );
}
