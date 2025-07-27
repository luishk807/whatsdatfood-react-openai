import { gql } from "@apollo/client";

export const LOGIN_QUERY = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
    }
  }
`;

export const LOGOUT_QUERY = gql`
  mutation logout {
    logout {
      success
    }
  }
`;

export const CHECK_AUTH = gql`
  query checkAuth {
    checkAuth {
      id
      first_name
      last_name
      email
      role_id
      status_id
    }
  }
`;
