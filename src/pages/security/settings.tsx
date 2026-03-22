import { useEffect } from 'react';
import Layout from '~/components/layout/Layout';
import { RingIntegrationSettings } from '~/components/settings/integrations/RingIntegrationSettings';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';
import { setSecurityFavicon } from '~/utils/faviconGenerator';

export default function SecuritySettingsPage() {
  useEffect(() => {
    setSecurityFavicon();
    document.title = 'Settings — Hudson Security';
  }, []);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="h-full-no-header overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl text-airq-dark glow-green uppercase tracking-wider">Settings</h1>
              <p className="text-airq-dark/50 text-sm mt-1">Manage security integrations and preferences</p>
            </div>
            <RingIntegrationSettings />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
