import { gql } from "@apollo/client";

/**
 * What somebody is into.
 *
 * The categories are public — a guest may personalise too, and requiring an
 * account just to say "I like coffee" is the sign-up wall this feature exists
 * to avoid. Anonymous choices live in the browser and merge into an account
 * when one is created.
 *
 * **`slug` is the identity and the only thing the browser keys on.** Not the
 * name, which is editable; not an icon, which the database deliberately does
 * not hold. `customConstants/foodIcons.tsx` decides how `coffee` is drawn, so
 * new artwork is one entry there and never a migration over saved preferences.
 */
export const TASTE_CATEGORIES = gql`
  query tasteCategories {
    tasteCategories {
      slug
      name
      kind
      display_order
      image_url
    }
  }
`;

export const MY_TASTE_PREFERENCES = gql`
  query myTastePreferences {
    myTastePreferences {
      slug
      name
      kind
      source
    }
  }
`;

/** The complete set of explicit tastes, not a delta — an empty list is valid. */
export const SAVE_TASTE_PREFERENCES = gql`
  mutation saveTastePreferences($input: SaveTastePreferencesInput!) {
    saveTastePreferences(input: $input) {
      slug
      name
      kind
      source
    }
  }
`;

/** Additive: choices made before signing in join what the account already has. */
export const MERGE_TASTE_PREFERENCES = gql`
  mutation mergeTastePreferences($input: SaveTastePreferencesInput!) {
    mergeTastePreferences(input: $input) {
      slug
      name
      kind
      source
    }
  }
`;
