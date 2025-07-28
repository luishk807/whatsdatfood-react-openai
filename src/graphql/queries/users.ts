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

export const ADD_USER_FAVORITES = gql`
  mutation addUserFavorites($input: CreateUserFavoritesInput!) {
    addUserFavorites(input: $input) {
      id
    }
  }
`;

export const CHECK_IF_FAVORITES = gql`
  query checkUserFavoriteBySlug($input: CreateUserFavoritesInput!) {
    checkUserFavoriteBySlug(input: $input)
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
export const DELETE_USER_FAVORITES = gql`
  mutation deleteUserFavorites($payload: ID!) {
    deleteUserRating(id: $payload)
  }
`;

export const CHECK_USERNAME_EXIST = gql`
  query checkUsername($username: String!) {
    checkUsername(username: $username)
  }
`;

export const GET_USER_RATING_BY_RESTAURANT_ID = gql`
  query getRatingByRestItemId($restItemId: ID!) {
    getRatingByRestItemId(restItemId: $restItemId) {
      id
      rating
      user_id
      comment
      title
      createdAt
      updatedAt
      restaurant_menu_item_id
    }
  }
`;
