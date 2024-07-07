import { type AppType } from "next/app";
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apolloClient';

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};

export default MyApp;