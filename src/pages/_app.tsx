import { ApolloProvider } from '@apollo/client';
import { type AppType } from "next/app";
import { JetBrains_Mono, Crimson_Text } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { RealtimeProvider } from '../context/RealtimeContext';
import { SensorDataProvider } from '../context/SensorDataContext';
import { RingProvider } from '../context/RingContext';
import { ToastProvider } from '../components/common/Toast';
import { GlanceableStatus } from '../components/common/GlanceableStatus';
import { useRealtimeCacheUpdater } from '../hooks/useRealtimeCacheUpdater';
import client from '../lib/apolloClient';

import "~/styles/globals.css";

function RealtimeBridge({ children }: { children: React.ReactNode }) {
  useRealtimeCacheUpdater();
  return <>{children}</>;
}

const jetBrainsFont = JetBrains_Mono({
  weight: ['600', '500', '400', '300', '200'],
  style: 'normal',
  subsets: ['latin']
});
const crimsonTextFont = Crimson_Text({
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin']
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${jetBrainsFont.style.fontFamily};
        }
        h1 {
          font-family: ${crimsonTextFont.style.fontFamily};
        }
      `}</style>
      <ApolloProvider client={client}>
        <AuthProvider>
          <RealtimeProvider>
            <RealtimeBridge>
              <ToastProvider>
                <SensorDataProvider>
                  <RingProvider>
                    <GlanceableStatus />
                    <Component {...pageProps} />
                  </RingProvider>
                </SensorDataProvider>
              </ToastProvider>
            </RealtimeBridge>
          </RealtimeProvider>
        </AuthProvider>
      </ApolloProvider>
    </>
  );
};

export default MyApp;