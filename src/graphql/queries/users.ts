import { gql } from "@apollo/client";

export const ADD_USER_MUTATION = gql`
  mutation addUser($payload: CreateUserInput!) {
    addUser(input: $payload) {
      first_name
      last_name
      phone
      email
    }
  }
`;

export const ADD_USER_FAVORITES = gql`
  mutation addUserFavorites($input: CreateUserFavoritesInput!) {
    addUserFavorites(input: $input) {
      id
    }
  }
`;
export const ADD_USER_RATING = gql`
  mutation addUserRating($payload: CreateUserRatingInput!) {
    addUserRating(input: $payload) {
      id
      rating
    }
  }
`;

export const ADD_USER_FRIEND = gql`
  mutation addUserFriend($payload: CreateUserFriendsInput!) {
    addUserFriend(input: $payload) {
      id
      name
      phone
      email
    }
  }
`;

export const DELETE_USER_FRIEND = gql`
  mutation deleteUserFriend($payload: ID!) {
    deleteUserFriend(id: $payload)
  }
`;

export const DELETE_USER_FAVORITES = gql`
  mutation deleteUserFavorites($payload: ID!) {
    deleteUserRating(id: $payload)
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation updateUser($payload: UpdateUserInput!) {
    addUser(input: $payload) {
      first_name
      last_name
      phone
      email
    }
  }
`;

export const UPDATE_USER_FRIEND = gql`
  mutation updateUserFriend($payload: UpdateUserFriendInput!) {
    updateUserFriend(input: $payload) {
      id
      first_name
      last_name
      email
    }
  }
`;

export const CHECK_USERNAME_EXIST = gql`
  query checkUsername($username: String!) {
    checkUsername(username: $username)
  }
`;

export const CHECK_IF_FAVORITES = gql`
  query checkUserFavoriteBySlug($slug: String!) {
    checkUserFavoriteBySlug(slug: $slug)
  }
`;

export const GET_USER_FAVORITES = gql`
  query getUserFavoritesByUser($page: Int, $limit: Int) {
    getUserFavoritesByUser(page: $page, limit: $limit) {
      data {
        id
        restaurant_id
        user_id
        createdAt
        updatedAt
        restaurant {
          id
          name
          slug
        }
        user {
          id
          first_name
          last_name
          email
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const GET_USER_DETAIL = gql`
  query userDetail {
    userDetail {
      first_name
      last_name
      email
      phone
      username
      dob
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_SEARCH = gql`
  query getUserSearchesByUser($page: Int, $limit: Int) {
    getUserSearchesByUser(page: $page, limit: $limit) {
      data {
        id
        name
        createdAt
        updatedAt
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const GET_USER_VIEWED = gql`
  query getUserViewsByUser($page: Int, $limit: Int) {
    getUserViewsByUser(page: $page, limit: $limit) {
      data {
        id
        restaurant_id
        user_id
        createdAt
        updatedAt
        restaurant {
          id
          name
          slug
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const GET_FRIENDS_BY_USER = gql`
  query getFriendsByUser($page: Int, $limit: Int) {
    getFriendsByUser(page: $page, limit: $limit) {
      data {
        id
        name
        email
        phone
        user_id
        createdAt
        updatedAt
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const GET_RATINGS_BY_USER = gql`
  query getRatingsByUser($page: Int!, $limit: Int) {
    getRatingsByUser(page: $page, limit: $limit) {
      data {
        id
        rating
        user_id
        comment
        title
        createdAt
        updatedAt
        restaurant_menu_item_id
        status {
          name
        }
        restaurantMenuItem {
          id
          name
          restaurant {
            name
          }
          images {
            url_m
            name
          }
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const GET_RATINGS_BY_REST_ITEM_ID = gql`
  query getRatingByRestItemId($restItemId: ID!, $page: Int!, $limit: Int) {
    getRatingByRestItemId(restItemId: $restItemId, page: $page, limit: $limit) {
      data {
        id
        rating
        user_id
        title
        comment
        restaurant_menu_item_id
        createdAt
        updatedAt
        status {
          name
        }
        restaurantMenuItem {
          id
          name
        }
        user {
          first_name
          last_name
        }
      }
      totalPages
      totalItems
      currentPage
    }
  }
`;
