import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { BACKEND_GRAPHQL_URL } from "@/customConstants";

const httpLink = new HttpLink({
  uri: `${BACKEND_GRAPHQL_URL}`,
  credentials: "include",
});
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
