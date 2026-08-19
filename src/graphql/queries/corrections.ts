import { gql } from "@apollo/client";

export const SUGGEST_DISH_CORRECTION = gql`
  mutation suggestDishCorrection($dishId: ID!, $field: String!, $value: String!) {
    suggestDishCorrection(dishId: $dishId, field: $field, value: $value) {
      id
      field
      value
      status
    }
  }
`;

export const PENDING_MENU_CORRECTIONS = gql`
  query pendingMenuCorrections($page: Int, $limit: Int) {
    pendingMenuCorrections(page: $page, limit: $limit) {
      data {
        id
        dish_id
        dish_name
        restaurant_name
        restaurant_slug
        field
        value
        previous_value
        status
        suggested_by
        createdAt
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const RESOLVE_MENU_CORRECTION = gql`
  mutation resolveMenuCorrection($correctionId: ID!, $approve: Boolean!) {
    resolveMenuCorrection(correctionId: $correctionId, approve: $approve)
  }
`;
