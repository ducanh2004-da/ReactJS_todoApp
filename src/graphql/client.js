import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";
export const client = new ApolloClient({
  link: new HttpLink({ uri: "http://localhost:3000/graphql" }),
  cache: new InMemoryCache(),
});