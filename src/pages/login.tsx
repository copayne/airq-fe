import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { LoginForm } from '~/components/auth/LoginForm';
import { useAuth } from '~/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { message } = router.query;

  // Redirect authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectTo = (router.query.redirect as string) || '/';
      void router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>hudson login</title>
        <meta name="description" content="sign into hudson dash" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="h-screen flex items-center justify-center stairs">
        <div className="max-w-md w-full space-y-6">
          {/* Status Messages */}
          {message === 'session_expired' && (
            <div className="p-3 bg-airq-contrast/20 border border-airq-contrast rounded-md shadow-card">
              <p className="text-sm text-airq-dark">
                Your session has expired. Please sign in again.
              </p>
            </div>
          )}
          
          {message === 'password_reset_success' && (
            <div className="p-3 bg-airq-primary/20 border border-airq-primary rounded-md shadow-card">
              <p className="text-sm text-airq-dark">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
            </div>
          )}

          {/* Login form */}
          <LoginForm
            redirectTo={(router.query.redirect as string) || '/'}
          />
        </div>
      </div>
    </>
  );
}