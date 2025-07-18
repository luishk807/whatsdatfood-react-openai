import { gql } from "@apollo/client";

export const GET_RESTAURANTS_BY_NAME = gql`
  query GetAiRestaurant($name: String!) {
    aiRestaurantNameList(name: $name) {
      name
      address
      city
      state
      postal_code
      slug
    }
  }
`;

export const GET_RESTAURANT_BY_SLUG = gql`
  query getRestaurantBySlug($slug: String) {
    aiRestaurantBySlug(slug: $slug) {
      name
      address
      city
      state
      postal_code
      restRestaurantItems {
        id
        name
        description
        top_choice
        price
        category
        restaurantItemRestImages {
          name
        }
      }
    }
  }
`;

export const GET_RESTAURANT_IMAGES = gql`
  query getRestaurantImages($restItemId: ID) {
    getRestaurantImage(id: $restItemId) {
      name
      url_m
      owner
      restaurantItemImageRestItem {
        name
        price
        top_choice
      }
    }
  }
`;
