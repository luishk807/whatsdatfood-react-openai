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
      phone
      michelin_score
      description
      rating
      delivery_method
      payment_method
      letter_grade
      website
      email
      tasting_menu_only
      drink_pairing_price
      tasting_menu_price
      price_range
      reservation_required
      reservation_available
      businessHours {
        day_of_week
        open_time
        close_time
      }
      restaurantMenuItems {
        id
        name
        description
        top_choice
        price
        category
        ratings {
          rating
        }
        images {
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
      restaurantMenuItem {
        name
        price
        top_choice
      }
    }
  }
`;
