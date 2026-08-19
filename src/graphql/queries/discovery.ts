import { gql } from "@apollo/client";

/**
 * Restaurant autocomplete. `sessionToken` is generated in the browser and
 * carried by every prediction and the final selection — it is what groups them
 * into one billed session on Google's side, which makes the predictions free
 * and leaves only the details call charged.
 */
export const RESTAURANT_SUGGESTIONS = gql`
  query restaurantSuggestions(
    $query: String!
    $sessionToken: String
    $latitude: Float
    $longitude: Float
  ) {
    restaurantSuggestions(
      query: $query
      sessionToken: $sessionToken
      latitude: $latitude
      longitude: $longitude
    ) {
      name
      address
      slug
      place_id
      known
    }
  }
`;

/** The one billed call: turn a chosen prediction into a restaurant we hold. */
export const RESOLVE_PLACE = gql`
  mutation resolvePlace($placeId: String!, $sessionToken: String) {
    resolvePlace(placeId: $placeId, sessionToken: $sessionToken) {
      slug
      name
    }
  }
`;
