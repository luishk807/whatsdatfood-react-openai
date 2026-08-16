import { gql } from "@apollo/client";

export const MY_RESTAURANT_CLAIMS = gql`
  query myRestaurantClaims {
    myRestaurantClaims {
      id
      status
      note
      createdAt
      decidedAt
      restaurant {
        slug
        name
        address
        city
      }
    }
  }
`;

export const IS_RESTAURANT_OWNER = gql`
  query isRestaurantOwner($slug: String!) {
    isRestaurantOwner(slug: $slug)
  }
`;

export const CLAIM_RESTAURANT = gql`
  mutation claimRestaurant(
    $slug: String!
    $verificationMethod: String
    $note: String
  ) {
    claimRestaurant(
      slug: $slug
      verificationMethod: $verificationMethod
      note: $note
    ) {
      id
      status
    }
  }
`;

export const UPDATE_RESTAURANT_FACTS = gql`
  mutation updateRestaurantFacts($input: UpdateRestaurantFactsInput!) {
    updateRestaurantFacts(input: $input) {
      slug
      name
      phone
      email
      website
      description
      price_range
    }
  }
`;

export const UPDATE_DISH_FACTS = gql`
  mutation updateDishFacts($input: UpdateDishFactsInput!) {
    updateDishFacts(input: $input) {
      id
      name
      description
      price
      category
      is_vegetarian
      is_vegan
      is_gluten_free
      contains_nuts
      contains_shellfish
      contains_dairy
      spice_level
      dietary_source
    }
  }
`;

export const DISCONTINUE_DISH = gql`
  mutation discontinueDish($dishId: ID!) {
    discontinueDish(dishId: $dishId)
  }
`;

/* --- admin --- */

export const PENDING_CLAIMS = gql`
  query pendingRestaurantClaims($page: Int, $limit: Int) {
    pendingRestaurantClaims(page: $page, limit: $limit) {
      data {
        id
        status
        note
        verification_method
        createdAt
        restaurant {
          slug
          name
          address
          city
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const DECIDE_CLAIM = gql`
  mutation decideRestaurantClaim($claimId: ID!, $approve: Boolean!, $note: String) {
    decideRestaurantClaim(claimId: $claimId, approve: $approve, note: $note) {
      id
      status
    }
  }
`;

export const REPORTED_PHOTOS = gql`
  query reportedPhotos($page: Int, $limit: Int) {
    reportedPhotos(page: $page, limit: $limit) {
      data {
        id
        reason
        note
        createdAt
        photo {
          id
          url_m
          owner
          source
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const RESOLVE_PHOTO_REPORT = gql`
  mutation resolvePhotoReport($reportId: ID!, $removePhoto: Boolean, $note: String) {
    resolvePhotoReport(
      reportId: $reportId
      removePhoto: $removePhoto
      note: $note
    )
  }
`;
