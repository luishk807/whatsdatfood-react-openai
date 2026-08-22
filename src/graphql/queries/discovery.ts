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

/**
 * Restaurants worth putting on the front door.
 *
 * `mode` comes back with the rows rather than being inferred from how many
 * arrived: whether this may be called "trending" is a rule about the data and
 * the server owns it.
 */
export const TRENDING_NEARBY = gql`
  query trendingNearby($latitude: Float!, $longitude: Float!, $limit: Int) {
    trendingNearby(latitude: $latitude, longitude: $longitude, limit: $limit) {
      mode
      area_label
      hot_pick {
        id
        slug
        name
        neighborhood
        cuisine
        price_range
        distance_km
        top_dish_name
        top_dish_photo_url
        photo_count
        recognitions {
          kind
          award
          source
          year
          reference_url
        }
        contributor_count
      }
      restaurants {
        id
        slug
        name
        neighborhood
        cuisine
        price_range
        distance_km
        top_dish_name
        top_dish_photo_url
        photo_count
        recognitions {
          kind
          award
          source
          year
          reference_url
        }
        contributor_count
      }
    }
  }
`;

export const MY_DISCOVERY_AREA = gql`
  query myDiscoveryArea {
    myDiscoveryArea {
      label
      city
      latitude
      longitude
      source
    }
  }
`;

export const SAVE_DISCOVERY_AREA = gql`
  mutation saveDiscoveryArea($input: SaveDiscoveryAreaInput!) {
    saveDiscoveryArea(input: $input) {
      label
      latitude
      longitude
      source
    }
  }
`;

export const FORGET_DISCOVERY_AREA = gql`
  mutation forgetDiscoveryArea {
    forgetDiscoveryArea
  }
`;
