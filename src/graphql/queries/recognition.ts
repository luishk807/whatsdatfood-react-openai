import { gql } from "@apollo/client";

/**
 * Curating an external recognition.
 *
 * All admin-only on the server. `status` and `internal_notes` come back only
 * here — on a public read they are withheld, because working notes about what
 * was ambiguous are our internal deliberation rather than anything a diner
 * should read under a restaurant's name.
 */
const FIELDS = `
  id
  kind
  award
  level
  source
  year
  status
  reference_url
  verified_at
  review_due_at
  valid_from
  valid_to
  internal_notes
`;

export const ADMIN_RECOGNITIONS = gql`
  query adminRecognitions($restaurantId: ID!) {
    adminRecognitions(restaurantId: $restaurantId) {
      ${FIELDS}
    }
  }
`;

export const ADD_RECOGNITION = gql`
  mutation addRecognition(
    $restaurantId: ID!
    $award: String!
    $source: String!
    $referenceUrl: String!
    $year: Int
    $validFrom: String
    $validTo: String
    $internalNotes: String
  ) {
    addRecognition(
      restaurantId: $restaurantId
      award: $award
      source: $source
      referenceUrl: $referenceUrl
      year: $year
      validFrom: $validFrom
      validTo: $validTo
      internalNotes: $internalNotes
    ) {
      ${FIELDS}
    }
  }
`;

export const EDIT_RECOGNITION = gql`
  mutation editRecognition(
    $recognitionId: ID!
    $award: String
    $source: String
    $referenceUrl: String
    $year: Int
    $validFrom: String
    $validTo: String
    $internalNotes: String
  ) {
    editRecognition(
      recognitionId: $recognitionId
      award: $award
      source: $source
      referenceUrl: $referenceUrl
      year: $year
      validFrom: $validFrom
      validTo: $validTo
      internalNotes: $internalNotes
    ) {
      ${FIELDS}
    }
  }
`;

export const VERIFY_RECOGNITION = gql`
  mutation verifyRecognition($recognitionId: ID!, $reviewDueAt: String) {
    verifyRecognition(recognitionId: $recognitionId, reviewDueAt: $reviewDueAt) {
      ${FIELDS}
    }
  }
`;

export const UNPUBLISH_RECOGNITION = gql`
  mutation unpublishRecognition($recognitionId: ID!) {
    unpublishRecognition(recognitionId: $recognitionId) {
      ${FIELDS}
    }
  }
`;

export const EXPIRE_RECOGNITION = gql`
  mutation expireRecognition($recognitionId: ID!) {
    expireRecognition(recognitionId: $recognitionId) {
      ${FIELDS}
    }
  }
`;
