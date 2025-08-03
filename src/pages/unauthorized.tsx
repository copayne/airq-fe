import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '~/context/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Unauthorized - Air Quality Dashboard</title>
        <meta name="description" content="You don't have permission to access this page" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            {/* Lock icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          
          <p className="text-lg text-gray-600 mb-2">
            You don&apos;t have permission to access this page.
          </p>
          
          {user && (
            <p className="text-sm text-gray-500 mb-6">
              Your current role: <span className="font-medium capitalize">{user.role}</span>
            </p>
          )}

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Dashboard
            </Link>
            
            <div>
              <p className="text-sm text-gray-500">
                Need access?{' '}
                <a
                  href="mailto:admin@airq-dashboard.com"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Contact an administrator
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}