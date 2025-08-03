'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useVerifyEmail } from '~/hooks/useAuthMutations';
import { useAuth } from '~/context/AuthContext';

interface EmailVerificationProps {
  token?: string;
  email?: string;
  showResendOption?: boolean;
}

export function EmailVerification({ token, email, showResendOption = false }: EmailVerificationProps) {
  const router = useRouter();
  const { verifyEmail, loading } = useVerifyEmail();
  const { user, isAuthenticated } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [message, setMessage] = useState('');

  const handleVerification = useCallback(async (verificationToken: string) => {
    try {
      const result = await verifyEmail({ token: verificationToken });
      
      if (result?.success) {
        setVerificationStatus('success');
        setMessage(result.message ?? 'Email verified successfully!');
        
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          void router.push('/');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(result?.message ?? 'Email verification failed. The link may be expired or invalid.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Email verification failed. Please try again.');
      console.error('Email verification error:', error);
    }
  }, [verifyEmail, router]);

  useEffect(() => {
    if (token) {
      void handleVerification(token);
    }
  }, [token, handleVerification]);


  const handleResendVerification = async () => {
    // This would typically call a resend verification endpoint
    // For now, we'll show a message
    setMessage('Please check your email for a new verification link.');
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
      case 'expired':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        );
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      case 'expired':
        return 'Link Expired';
      case 'pending':
      default:
        return loading ? 'Verifying Email...' : 'Email Verification';
    }
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (verificationStatus) {
      case 'success':
        return 'Your email has been successfully verified. You will be redirected to the dashboard shortly.';
      case 'error':
        return 'We could not verify your email. The verification link may be invalid or expired.';
      case 'expired':
        return 'This verification link has expired. Please request a new verification email.';
      case 'pending':
      default:
        return loading ? 'Please wait while we verify your email address...' : 'Click the button below to verify your email address.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {getStatusIcon()}
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {getStatusTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {email && `Verification for: ${email}`}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="text-center">
            <p className="text-gray-700">
              {getStatusMessage()}
            </p>
          </div>

          {verificationStatus === 'error' && showResendOption && (
            <div className="text-center space-y-4">
              <button
                onClick={handleResendVerification}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Resend Verification Email
              </button>
            </div>
          )}

          {(verificationStatus === 'success' || verificationStatus === 'error') && (
            <div className="text-center">
              <button
                onClick={() => router.push(isAuthenticated ? '/' : '/login')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
              </button>
            </div>
          )}
        </div>

        {user?.emailVerified === false && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Email verification required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Please check your email and click the verification link to activate your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}