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

export const ADD_USER_RATING = gql`
  mutation addUserRating($payload: userRatingPayload) {
    addUserRating(input: $payload) {
      id
      rating
    }
  }
`;
