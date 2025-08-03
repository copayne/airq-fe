import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '~/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
    if (user) {
      void router.replace('/dash');
    } else {
      void router.replace('/login');
    }
  }, [user, isLoading, router]);

  return null;
}
