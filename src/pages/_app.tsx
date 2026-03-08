import { ApolloProvider } from '@apollo/client';
import { type AppType } from "next/app";
import localFont from 'next/font/local';
import { AuthProvider } from '../context/AuthContext';
import { RealtimeProvider } from '../context/RealtimeContext';
import { SensorDataProvider } from '../context/SensorDataContext';
import { RingProvider } from '../context/RingContext';
import { RSSProvider } from '../context/RSSContext';
import { ToastProvider } from '../components/common/Toast';
import { GlanceableStatus } from '../components/common/GlanceableStatus';
import { useRealtimeCacheUpdater } from '../hooks/useRealtimeCacheUpdater';
import { useIsNewsSite } from '../hooks/useIsNewsSite';
import client from '../lib/apolloClient';

import "~/styles/globals.css";

function RealtimeBridge({ children }: { children: React.ReactNode }) {
  useRealtimeCacheUpdater();
  return <>{children}</>;
}

const jetBrainsFont = localFont({
  src: '../fonts/JetBrainsMono-Variable.ttf',
  display: 'swap',
});
const crimsonTextFont = localFont({
  src: [
    { path: '../fonts/CrimsonText-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/CrimsonText-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../fonts/CrimsonText-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../fonts/CrimsonText-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../fonts/CrimsonText-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../fonts/CrimsonText-BoldItalic.ttf', weight: '700', style: 'italic' },
  ],
  display: 'swap',
});
const playfairFont = localFont({
  src: [
    { path: '../fonts/PlayfairDisplay-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/PlayfairDisplay-Bold.ttf', weight: '700', style: 'normal' },
  ],
  display: 'swap',
});

const MyApp: AppType = ({ Component, pageProps }) => {
  const isNews = useIsNewsSite();

  return (
    <div className={isNews ? 'theme-news' : ''}>
      <style jsx global>{`
        html {
          font-family: ${jetBrainsFont.style.fontFamily};
        }
        h1 {
          font-family: ${crimsonTextFont.style.fontFamily};
        }
        .theme-news .masthead {
          font-family: ${playfairFont.style.fontFamily};
        }
      `}</style>
      <ApolloProvider client={client}>
        <AuthProvider>
          <ToastProvider>
            {isNews ? (
              <RSSProvider>
                <Component {...pageProps} />
              </RSSProvider>
            ) : (
              <RealtimeProvider>
                <RealtimeBridge>
                  <SensorDataProvider>
                    <RingProvider>
                      <GlanceableStatus />
                      <Component {...pageProps} />
                    </RingProvider>
                  </SensorDataProvider>
                </RealtimeBridge>
              </RealtimeProvider>
            )}
          </ToastProvider>
        </AuthProvider>
      </ApolloProvider>
    </div>
  );
};

export default MyApp;