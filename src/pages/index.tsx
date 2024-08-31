import React from 'react';
import Head from "next/head";
import AirQualityDashboard from '~/components/dashboard/AirQualityDashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>Hudson Air Quality Project</title>
        <meta name="description" content="Hudson Air Quality Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AirQualityDashboard />
    </>
  );
}
