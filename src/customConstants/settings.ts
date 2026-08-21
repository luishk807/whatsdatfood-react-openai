import { ROUTES } from "@/customConstants/routes";

/**
 * What Settings holds, as data.
 *
 * **The landing page is a list of sections, not a form.** It used to be one
 * long column: display name, username, email, phone, two password boxes and a
 * delete-my-account button, with "Save changes" floating between two unrelated
 * cards. Everything carried the same weight, so nothing read as more
 * consequential than anything else - and the one control that erases an
 * account sat in the same scroll as the one that changes a nickname.
 *
 * **Everything about you is reachable from here.** Taste preferences and the
 * discovery area both existed and both lived somewhere else, so changing a
 * setting meant leaving Settings and hunting. Their routes still work; this
 * is where a person looks for them.
 *
 * **A section that cannot be used is declared, not linked.** `available: false`
 * renders the row greyed and inert rather than as a link into an empty page -
 * the same call `AUTH_PROVIDERS` makes for "Continue with Google" and the
 * verification providers make for SMS codes. Notifications has no backend at
 * all, and a row that navigates somewhere blank is worse than one that says
 * "not yet": the first looks broken, the second looks planned. Building the
 * backend later is flipping this flag.
 */
export interface SettingsSection {
  id: string;
  label: string;
  /** One line under the title. Says what is inside, never why. */
  blurb: string;
  route: string;
  /** False where nothing is behind it yet. Rendered, never navigable. */
  available: boolean;
}

export interface SettingsGroup {
  id: string;
  label: string;
  items: SettingsSection[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    id: "personal",
    label: "Personal",
    items: [
      {
        id: "profile",
        label: "Profile",
        blurb: "Photo, display name and username",
        route: ROUTES.settingsProfile,
        available: true,
      },
      {
        id: "preferences",
        label: "Food preferences",
        blurb: "Cuisines and foods you want to discover",
        route: ROUTES.settingsPreferences,
        available: true,
      },
      {
        id: "location",
        label: "Location & discovery",
        blurb: "Where we look for places near you",
        route: ROUTES.settingsLocation,
        available: true,
      },
    ],
  },
  {
    id: "app",
    label: "App",
    items: [
      {
        // Declared so the shape of Settings is complete and somebody can see
        // where this will live. There is no notification backend - no
        // subscription table, no delivery, no preference column - and
        // inventing one to fill a row is exactly the unnecessary backend work
        // this is meant to avoid.
        id: "notifications",
        label: "Notifications",
        blurb: "Not available yet",
        route: ROUTES.settingsNotifications,
        available: false,
      },
      {
        id: "privacy",
        label: "Contributions & privacy",
        blurb: "What we store and what other people can see",
        route: ROUTES.settingsPrivacy,
        available: true,
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      {
        id: "account",
        label: "Account & security",
        blurb: "Email, phone and password",
        route: ROUTES.settingsAccount,
        available: true,
      },
    ],
  },
];

export const SETTINGS_LABELS_HUB = {
  title: "Settings",
  back: "Settings",
  /**
   * Its own group at the bottom, visually separated and last.
   *
   * Deleting an account is not a setting, it is an ending - and it used to sit
   * in the same scroll as the display name field, one mis-tap from somebody
   * meaning to press Save.
   */
  dangerLabel: "Account management",
  soon: "Soon",
} as const;

/** Every section, flattened - for the desktop sidebar and for tests. */
export const SETTINGS_SECTIONS: SettingsSection[] = SETTINGS_GROUPS.flatMap(
  (group) => group.items,
);
