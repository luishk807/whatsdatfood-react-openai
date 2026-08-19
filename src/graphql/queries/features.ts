import { gql } from "@apollo/client";

/**
 * What this caller may use.
 *
 * A list of what is on, never a map of what is off: `pro: false` would put
 * the name of an unlaunched product in every visitor's network tab, and the
 * requirement is that a normal experience contains no trace of it.
 */
export const ENABLED_FEATURES = gql`
  query enabledFeatures {
    enabledFeatures
  }
`;

/** Hidden / internal testing / live, for the admin console. Admin only. */
export const FEATURE_STATUSES = gql`
  query featureStatuses {
    featureStatuses {
      feature
      status
    }
  }
`;

/**
 * The Pro plans. Guarded on the server: a caller who may not see Pro gets a
 * refusal, not an empty list, so this is never a way to learn the feature
 * exists.
 */
export const MEMBERSHIP_PLANS_QUERY = gql`
  query membershipPlans {
    membershipPlans {
      id
      name
      price
      benefits
      href
      highlighted
    }
  }
`;
