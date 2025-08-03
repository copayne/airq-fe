import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '~/context/AuthContext';
import { RegisterForm } from '~/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectTo = (router.query.redirect as string) || '/';
      void router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Create Account - Air Quality Dashboard</title>
        <meta name="description" content="Create your Air Quality Dashboard account" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Air Quality Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create an account to access air quality monitoring
            </p>
          </div>

          {/* Registration form */}
          <RegisterForm
            redirectTo={(router.query.redirect as string) || '/'}
          />
        </div>
      </div>
    </>
  );
}