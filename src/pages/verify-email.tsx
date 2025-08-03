import React from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { EmailVerification } from '~/components/auth/EmailVerification';

interface VerifyEmailPageProps {
  token?: string;
  email?: string;
}

export default function VerifyEmailPage({ token, email }: VerifyEmailPageProps) {
  return (
    <>
      <Head>
        <title>Verify Email - AirQ</title>
        <meta name="description" content="Verify your email address to complete your AirQ account setup." />
      </Head>
      
      <EmailVerification 
        token={token} 
        email={email} 
        showResendOption={true}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token, email } = context.query;
  
  return {
    props: {
      token: typeof token === 'string' ? token : undefined,
      email: typeof email === 'string' ? email : undefined,
    },
  };
};