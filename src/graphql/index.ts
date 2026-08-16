import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { BACKEND_GRAPHQL_URL } from "@/customConstants";

const httpLink = new HttpLink({
  uri: `${BACKEND_GRAPHQL_URL}`,
  credentials: "include",
});

/**
 * Menus are expensive to produce — a miss can mean an image search and an LLM
 * call — so the cache is configured to actually normalise rather than storing
 * a fresh blob per query.
 *
 * Restaurants have no id in the API surface, so they are keyed by slug, which
 * is what the routes use anyway. Dishes and ratings key by id, which lets a
 * vote update one dish in place instead of invalidating the whole menu.
 */
const cache = new InMemoryCache({
  typePolicies: {
    Restaurant: {
      keyFields: ["slug"],
    },
    RestaurantMenuItem: {
      keyFields: ["id"],
      fields: {
        // A dish's ratings are replaced wholesale, not merged, so removing a
        // vote actually removes it.
        ratings: {
          merge: (_existing, incoming) => incoming,
        },
        images: {
          merge: (_existing, incoming) => incoming,
        },
      },
    },
    UserRating: {
      keyFields: ["id"],
    },
    // Photos carry no id in any selection, so they stay embedded in their dish.
    RestaurantMenuItemImages: {
      keyFields: false,
    },
    BusinessHours: {
      keyFields: false,
    },
    Query: {
      fields: {
        aiRestaurantBySlug: {
          keyArgs: ["slug"],
        },
        aiRestaurantNameList: {
          keyArgs: ["name"],
        },
        getRestaurantImage: {
          keyArgs: ["id"],
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache,
});

export default client;
