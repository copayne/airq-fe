import React from 'react';
import Head from "next/head";
import AirQualityDashboard from '~/components/dashboard/AirQualityDashboard';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Hudson Air Quality Dashboard</title>
        <meta name="description" content="Hudson Air Quality Project Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProtectedRoute requiredRole="viewer">
        <AirQualityDashboard />
      </ProtectedRoute>
    </>
  );
}