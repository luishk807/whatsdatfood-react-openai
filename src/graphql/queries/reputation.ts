import { gql } from "@apollo/client";

/**
 * The level block is identical in both documents and deliberately duplicated
 * rather than shared through a fragment: these are the only two places it is
 * asked for, and a fragment adds an indirection for no reuse.
 */
export const MY_FOOD_CRED = gql`
  query myFoodCred {
    myFoodCred {
      food_cred
      photo_count
      dish_count
      restaurant_count
      badges {
        id
        name
        description
        icon
        earnedAt
        progress
        target
      }
      level {
        key
        name
        floor
        next_name
        next_at
        cred_to_next
        progress
      }
    }
  }
`;

export const FOOD_CRED_HISTORY = gql`
  query foodCredHistory($page: Int, $limit: Int) {
    foodCredHistory(page: $page, limit: $limit) {
      data {
        id
        event_type
        points
        label
        dish_name
        restaurant_name
        restaurant_slug
        photo_url
        reversed
        createdAt
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const CONTRIBUTOR_PROFILE = gql`
  query contributorProfile($username: String!) {
    contributorProfile(username: $username) {
      username
      display_name
      food_cred
      photo_count
      dish_count
      restaurant_count
      joinedAt
      badges {
        id
        name
        description
        icon
        earnedAt
        progress
        target
      }
      level {
        key
        name
        floor
        next_name
        next_at
        cred_to_next
        progress
      }
    }
  }
`;

export const RESTAURANT_LEADERBOARD = gql`
  query restaurantLeaderboard($slug: String!, $limit: Int) {
    restaurantLeaderboard(slug: $slug, limit: $limit) {
      username
      display_name
      cred
    }
  }
`;
