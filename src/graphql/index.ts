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
    RestaurantBusinessHours: {
      keyFields: false,
    },
    Query: {
      fields: {
        aiRestaurantBySlug: {
          keyArgs: ["slug"],
        },
        aiRestaurantNameList: {
          // Both args: a database-only miss must not be replayed as the
          // answer to a submit that is allowed to generate.
          keyArgs: ["name", "generate"],
        },
        getRestaurantImage: {
          keyArgs: ["id"],
        },

        /**
         * Nearby results arrive one batch at a time and accumulate.
         *
         * `keyArgs` deliberately omits `offset`: every page of the same
         * search belongs in one list, and including it would file page two
         * under its own key so "Show more" replaced the results instead of
         * extending them. Everything that genuinely changes *which* search
         * this is — where, how wide, what cuisine — is in the key, so
         * changing the location starts a new list rather than appending to
         * somebody else's.
         *
         * Written positionally rather than concatenated, so re-requesting a
         * page already held overwrites it instead of duplicating it.
         */
        nearbyRestaurants: {
          keyArgs: ["latitude", "longitude", "radiusKm", "cuisine"],
          merge: (existing: unknown[] = [], incoming: unknown[], options) => {
            const merged = existing.slice();
            const start = (options.args?.offset as number) ?? 0;

            incoming.forEach((row, index) => {
              merged[start + index] = row;
            });

            return merged;
          },
        },

        /** The same, keyed on the box the reader was looking at. */
        restaurantsInArea: {
          keyArgs: ["north", "south", "east", "west", "cuisine"],
          merge: (existing: unknown[] = [], incoming: unknown[], options) => {
            const merged = existing.slice();
            const start = (options.args?.offset as number) ?? 0;

            incoming.forEach((row, index) => {
              merged[start + index] = row;
            });

            return merged;
          },
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
