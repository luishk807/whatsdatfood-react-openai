import { ApolloClient, InMemoryCache } from "@apollo/client";
import { BACKEND_GRAPHQL_URL } from "@/customConstants";

const client = new ApolloClient({
  uri: `${BACKEND_GRAPHQL_URL}`,
  cache: new InMemoryCache(),
  credentials: "include",
});

export default client;
