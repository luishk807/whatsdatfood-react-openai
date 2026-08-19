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
  ) {
    nearbyRestaurants(
      latitude: $latitude
      longitude: $longitude
      radiusKm: $radiusKm
      limit: $limit
      cuisine: $cuisine
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
  ) {
    restaurantsInArea(
      north: $north
      south: $south
      east: $east
      west: $west
      limit: $limit
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
