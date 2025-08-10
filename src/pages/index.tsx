import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout from '~/components/layout/Layout';
import { useAuth } from '~/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
    if (user) {
      void router.push('/dash');
    } else {
      void router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show a minimal loading state instead of null to prevent white flash
  return (
    <Layout>
      <div className="h-full-no-header flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-airq-contrast"></div>
      </div>
    </Layout>
  );
}
