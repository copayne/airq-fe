import { useEffect } from 'react';
import Layout from '~/components/layout/Layout';
import SecurityDashboard from '~/components/security/SecurityDashboard';
import { setSecurityFavicon } from '~/utils/faviconGenerator';

export default function SecurityPage() {
  useEffect(() => {
    setSecurityFavicon();
    document.title = 'Hudson Security';
  }, []);

  return (
    <Layout>
      <SecurityDashboard />
    </Layout>
  );
}
