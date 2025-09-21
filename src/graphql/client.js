import { ApolloClient, HttpLink, InMemoryCache, gql, createHttpLink } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';



// For Vite, use import.meta.env.VITE_REACT_APP_GRAPHQL_URL only
const GRAPHQL_URL = import.meta.env.VITE_REACT_APP_GRAPHQL_URL;
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_REACT_APP_GRAPHQL_URL, // endpoint NestJS GraphQL
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token'); // token = "Bearer xxx" or just token
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});