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
export const ADD_USER_RATING = gql`
  mutation addUserRating($payload: CreateUserRatingInput!) {
    addUserRating(input: $payload) {
      id
      rating
    }
  }
`;

export const ADD_USER_FAVORITES = gql`
  mutation addUserFavorites($payload: CreateUserFavoritesInput!) {
    addUserFavorites(input: $payload) {
      id
      restaurant_id
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
