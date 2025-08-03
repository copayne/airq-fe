import { type AppType } from "next/app";
import { ApolloProvider } from '@apollo/client';
import { SensorDataProvider } from '../context/SensorDataContext';
import { AuthProvider } from '../context/AuthContext';
import client from '../lib/apolloClient';
import { Inconsolata } from 'next/font/google';

import "~/styles/globals.css";

const inconsolataFont = Inconsolata({
  weight: ['200', '300', '400', '500', '600'],
  style: 'normal',
  subsets: ['latin'],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inconsolataFont.style.fontFamily};
        }
      `}</style>
      <ApolloProvider client={client}>
        <AuthProvider>
          <SensorDataProvider>
            <Component {...pageProps} />
          </SensorDataProvider>
        </AuthProvider>
      </ApolloProvider>
    </>
  );
};

export default MyApp;