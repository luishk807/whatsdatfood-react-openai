import { gql } from "@apollo/client";

export const LOGIN_QUERY = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
    }
  }
`;

export const CHECK_AUTH = gql`
  query checkAuth {
    checkAuth {
      first_name
      last_name
      email
      dob
      created_at
      userUserRole {
        name
      }
      userUserRatings {
        rating
      }
    }
  }
`;
