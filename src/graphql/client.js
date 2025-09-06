import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";



// For Vite, use import.meta.env.VITE_REACT_APP_GRAPHQL_URL only
const GRAPHQL_URL = import.meta.env.VITE_REACT_APP_GRAPHQL_URL;

export const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),
  cache: new InMemoryCache(),
});