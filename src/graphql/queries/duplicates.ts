import { gql } from "@apollo/client";

/**
 * The duplicate queue. Admin-only on the server.
 *
 * Both restaurants come back in full because the decision is a comparison —
 * an admin should not have to open two tabs to make it.
 */
const SIDE = `
  id
  slug
  name
  address
  city
  latitude
  longitude
  phone
  website
  place_type
  cuisine
  osm_id
  menu_items
`;

export const DUPLICATE_CANDIDATES = gql`
  query duplicateCandidates {
    duplicateCandidates {
      id
      status
      confidence
      metres
      chain_locations
      reasons
      left { ${SIDE} }
      right { ${SIDE} }
    }
  }
`;

export const RESOLVE_DUPLICATE = gql`
  mutation resolveDuplicate($pairId: ID!, $status: String!) {
    resolveDuplicate(pairId: $pairId, status: $status)
  }
`;
