import { ApolloProvider } from '@apollo/client';
import { type AppType } from "next/app";
import { JetBrains_Mono, Crimson_Text } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { SensorDataProvider } from '../context/SensorDataContext';
import { RingProvider } from '../context/RingContext';
import { ToastProvider } from '../components/common/Toast';
import client from '../lib/apolloClient';

import "~/styles/globals.css";

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
          <ToastProvider>
            <SensorDataProvider>
              <RingProvider>
                <Component {...pageProps} />
              </RingProvider>
            </SensorDataProvider>
          </ToastProvider>
        </AuthProvider>
      </ApolloProvider>
    </>
  );
};

export default MyApp;