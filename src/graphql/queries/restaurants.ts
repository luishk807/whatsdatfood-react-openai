import { gql } from "@apollo/client";

/**
 * `generate` decides whether a miss is allowed to reach the model. Suggestions
 * pass false: every pause in someone's typing was otherwise a generation, and
 * a visitor gets five an hour.
 */
export const GET_RESTAURANTS_BY_NAME = gql`
  query GetAiRestaurant($name: String!, $generate: Boolean) {
    aiRestaurantNameList(name: $name, generate: $generate) {
      name
      address
      city
      state
      postal_code
      slug
    }
  }
`;

/**
 * Ratings are selected alongside the dish so a vote can be written straight
 * into the normalised cache without refetching the whole menu.
 */
export const MENU_ITEM_RATINGS_FRAGMENT = gql`
  fragment MenuItemRatings on RestaurantMenuItem {
    id
    ratings {
      id
      rating
      user_id
    }
  }
`;

export const GET_RESTAURANT_BY_SLUG = gql`
  query getRestaurantBySlug($slug: String) {
    aiRestaurantBySlug(slug: $slug) {
      slug
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
      parking_available
      cash_only
      card_payment
      drive_through
      delivery_option
      businessHours {
        day_of_week
        open_time
        close_time
      }
      diner_count
      restaurantMenuItems {
        id
        name
        description
        top_choice
        price
        category
        order_count
        ordered_by_me
        is_vegetarian
        is_vegan
        is_gluten_free
        contains_nuts
        contains_shellfish
        contains_dairy
        spice_level
        dietary_source
        ratings {
          id
          rating
          user_id
        }
        images {
          id
          name
          url_m
          url_s
          owner
          source
          is_primary
          helpful_count
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
      url_s
      owner
    }
  }
`;

/** Every photo for a dish, hero first. Public — browsing needs no session. */
export const GET_DISH_PHOTOS = gql`
  query dishPhotos($itemId: ID!) {
    dishPhotos(itemId: $itemId) {
      id
      url_m
      url_s
      owner
      source
      is_primary
      helpful_count
      createdAt
    }
  }
`;

export const VOTE_DISH_PHOTO = gql`
  mutation voteDishPhoto($imageId: ID!) {
    voteDishPhoto(imageId: $imageId) {
      id
      helpful_count
      is_primary
    }
  }
`;

export const REPORT_DISH_PHOTO = gql`
  mutation reportDishPhoto($imageId: ID!, $reason: String!, $note: String) {
    reportDishPhoto(imageId: $imageId, reason: $reason, note: $note)
  }
`;

export const RECORD_DISH_ORDERS = gql`
  mutation recordDishOrders($dishIds: [ID!]!) {
    recordDishOrders(dishIds: $dishIds)
  }
`;

export const FORGET_DISH_ORDER = gql`
  mutation forgetDishOrder($dishId: ID!) {
    forgetDishOrder(dishId: $dishId)
  }
`;
