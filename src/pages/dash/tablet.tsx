import React from 'react';
import Head from 'next/head';
import TabletLayout from '~/components/layout/TabletLayout';
import AirQualityDashboard from '~/components/dashboard/AirQualityDashboard';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

export default function TabletDashboard() {
  return (
    <>
      <Head>
        <title>Hudson Air - Tablet</title>
        <meta name="description" content="Hudson Air Quality Dashboard - Tablet View" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <ProtectedRoute requiredRole="viewer">
        <TabletLayout>
          <AirQualityDashboard compact bare />
        </TabletLayout>
      </ProtectedRoute>
    </>
  );
}
