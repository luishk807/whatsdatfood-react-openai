import { gql } from "@apollo/client";

/**
 * Finding food near you. All public — browsing needs no session, and the
 * front door has to work before anybody has an account.
 */

export const NEARBY_RESTAURANTS = gql`
  query nearbyRestaurants(
    $latitude: Float!
    $longitude: Float!
    $radiusKm: Float
    $limit: Int
    $cuisine: String
    $offset: Int
  ) {
    nearbyRestaurants(
      latitude: $latitude
      longitude: $longitude
      radiusKm: $radiusKm
      limit: $limit
      cuisine: $cuisine
      offset: $offset
    ) {
      id
      slug
      name
      address
      city
      neighborhood
      cuisine
      price_range
      latitude
      longitude
      distance_km
      top_dish_name
      top_dish_photo_url
      photo_count
      contributor_count
    }
  }
`;

export const RESTAURANTS_IN_AREA = gql`
  query restaurantsInArea(
    $north: Float!
    $south: Float!
    $east: Float!
    $west: Float!
    $limit: Int
    $cuisine: String
    $offset: Int
  ) {
    restaurantsInArea(
      north: $north
      south: $south
      east: $east
      west: $west
      limit: $limit
      cuisine: $cuisine
      offset: $offset
    ) {
      id
      slug
      name
      address
      city
      neighborhood
      cuisine
      price_range
      latitude
      longitude
      distance_km
      top_dish_name
      top_dish_photo_url
      photo_count
      contributor_count
    }
  }
`;

export const RESOLVE_LOCATION = gql`
  query resolveLocation($query: String!) {
    resolveLocation(query: $query) {
      latitude
      longitude
      label
    }
  }
`;

export const NEARBY_DISCOVERY = gql`
  query nearbyDiscovery(
    $latitude: Float!
    $longitude: Float!
    $radiusKm: Float
    $limit: Int
  ) {
    nearbyDiscovery(
      latitude: $latitude
      longitude: $longitude
      radiusKm: $radiusKm
      limit: $limit
    ) {
      area_label
      mode
      trending {
        dish_id
        dish_name
        restaurant_name
        restaurant_slug
        distance_km
        photo_url
        photo_thumb_url
        photographer
        score
        photo_count
        vote_count
        contributor_count
      }
      needs_photos {
        dish_id
        dish_name
        restaurant_name
        restaurant_slug
        distance_km
      }
    }
  }
`;

/**
 * Whether we are still finding out what is around a point.
 *
 * Separate from the results on purpose. `nearbyRestaurants` answers out of our
 * own rows and returns; this says whether a look at somewhere we have never
 * been is still running, so the page can show one quiet line and ask again
 * rather than making anybody wait.
 */
export const NEARBY_COVERAGE = gql`
  query nearbyCoverage($latitude: Float!, $longitude: Float!, $cuisine: String) {
    nearbyCoverage(
      latitude: $latitude
      longitude: $longitude
      cuisine: $cuisine
    ) {
      cell
      searching
    }
  }
`;
