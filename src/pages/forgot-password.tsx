import React from 'react';
import Head from 'next/head';
import { ForgotPasswordForm } from '~/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <>
      <Head>
        <title>Forgot Password - AirQ</title>
        <meta name="description" content="Reset your AirQ account password." />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ForgotPasswordForm />
      </div>
    </>
  );
}