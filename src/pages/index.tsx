import React from 'react';
import Head from "next/head";
import AirQualityDashboard from '~/components/dashboard/AirQualityDashboard';
import { Inconsolata } from 'next/font/google';

const inconsolataFont = Inconsolata({
  weight: ['200', '300', '400', '500', '600'],
  style: 'normal',
  subsets: ['latin'],
});

export default function Home() {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inconsolataFont.style.fontFamily};
        }
      `}</style>
      <Head>
        <title>Hudson Air Quality Project</title>
        <meta name="description" content="Hudson Air Quality Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AirQualityDashboard />
    </>
  );
}
