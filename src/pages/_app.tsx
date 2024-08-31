import { type AppType } from "next/app";
import { ApolloProvider } from '@apollo/client';
import { SensorDataProvider } from '../context/SensorDataContext';
import client from '../lib/apolloClient';

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ApolloProvider client={client}>
      <SensorDataProvider>
        <Component {...pageProps} />
      </SensorDataProvider>
    </ApolloProvider>
  );
};

export default MyApp;