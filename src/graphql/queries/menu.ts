import { gql } from "@apollo/client";

/**
 * Changing a menu: a diner adding a dish, and an owner managing one.
 *
 * The dish fields here mirror what the menu query already selects, plus the
 * provenance columns. Worth remembering that `restaurantInfo` in
 * `MenuResults` is assembled field by field — a new field on a query is
 * invisible until it is named there too, which is how the Champion badge
 * silently failed to render once already.
 */

const DISH_FIELDS = gql`
  fragment ManagedDishFields on RestaurantMenuItem {
    id
    name
    description
    price
    category
    source
    verification_status
    is_available
    sort_order
    added_by
  }
`;

export const SUBMIT_DISH = gql`
  ${DISH_FIELDS}
  mutation submitDish($input: SubmitDishInput!) {
    submitDish(input: $input) {
      ...ManagedDishFields
    }
  }
`;

export const PENDING_DISH_SUBMISSIONS = gql`
  query pendingDishSubmissions($page: Int, $limit: Int) {
    pendingDishSubmissions(page: $page, limit: $limit) {
      data {
        id
        name
        description
        price
        category
        source
        verification_status
        added_by
        restaurant {
          slug
          name
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const DECIDE_DISH_SUBMISSION = gql`
  mutation decideDishSubmission($dishId: ID!, $approve: Boolean!, $note: String) {
    decideDishSubmission(dishId: $dishId, approve: $approve, note: $note)
  }
`;

export const OWNER_MENU = gql`
  ${DISH_FIELDS}
  query ownerMenu($slug: String!) {
    ownerMenu(slug: $slug) {
      slug
      name
      menu_verified_at
      menu_updated_at
      pending_count
      dishes {
        ...ManagedDishFields
      }
      categories {
        id
        name
        position
        dish_count
      }
    }
  }
`;

export const SET_DISH_AVAILABILITY = gql`
  ${DISH_FIELDS}
  mutation setDishAvailability($dishId: ID!, $available: Boolean!) {
    setDishAvailability(dishId: $dishId, available: $available) {
      ...ManagedDishFields
    }
  }
`;

export const ARCHIVE_DISH = gql`
  mutation archiveDish($dishId: ID!) {
    archiveDish(dishId: $dishId)
  }
`;

export const RESTORE_DISH = gql`
  mutation restoreDish($dishId: ID!) {
    restoreDish(dishId: $dishId)
  }
`;

export const SAVE_MENU_CATEGORIES = gql`
  mutation saveMenuCategories($slug: String!, $names: [String!]!) {
    saveMenuCategories(slug: $slug, names: $names) {
      id
      name
      position
      dish_count
    }
  }
`;

export const RENAME_MENU_CATEGORY = gql`
  mutation renameMenuCategory($slug: String!, $old: String!, $new: String!) {
    renameMenuCategory(slug: $slug, old: $old, new: $new)
  }
`;

export const REORDER_DISHES = gql`
  mutation reorderDishes($slug: String!, $dishIds: [ID!]!) {
    reorderDishes(slug: $slug, dishIds: $dishIds)
  }
`;

export const MARK_MENU_VERIFIED = gql`
  mutation markMenuVerified($slug: String!) {
    markMenuVerified(slug: $slug)
  }
`;

export const DISH_HISTORY = gql`
  query dishHistory($dishId: ID!) {
    dishHistory(dishId: $dishId) {
      id
      action
      field
      previous_value
      new_value
      note
      by
      created_at
    }
  }
`;
