import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const IP_ADDRESS = 'http://10.201.1.115';
const PORT = '5000';

const httpLink = new HttpLink({
  uri: `${IP_ADDRESS}:${PORT}/graphql`,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;