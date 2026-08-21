import { ROUTES } from "@/customConstants/routes";

export const DEFAULT_CURRENCY = {
  code: "en-US",
  name: "USD",
};

export const PAGE_DEFAULT = 1;
export const LIMIT_DEFAULT = 10;

export const BACKEND_URL: string | undefined =
  process.env.REACT_APP_BACKEND_URL;
export const BACKEND_GRAPHQL_URL: string | undefined =
  process.env.REACT_APP_GRAPHQL_BACKEND_URL;

export const LOADING_TYPES = {
  LINEAR: "linear",
  CIRCULAR: "circular",
  SPINER: "spiner",
  CUSTOM: "custom",
};

export const FIELD_TYPES = {
  textfield: "text",
  button: "button",
  submit: "submit",
  email: "email",
  date: "date",
  password: "password",
  rating: "rating",
  username: "username",
} as const;

export const ACCOUNT_TYPE = {
  guest: "3",
  user: "1",
  admin: "2",
};

export const LOGOUT_MENU = {
  name: "Logout",
  url: ROUTES.logout,
};

export const DROPDOWN_MENU = {
  "1": [
    {
      name: "Profile & account",
      url: ROUTES.settings,
    },
    {
      name: "Friends",
      url: ROUTES.friends,
    },
    {
      name: "Ratings",
      url: ROUTES.ratings,
    },
    {
      name: "History",
      url: ROUTES.history,
    },
    {
      name: "Favorites",
      url: ROUTES.favorites,
    },
    {
      name: "Manage",
      url: ROUTES.manage,
    },
  ],
  "3": [
    {
      name: "Sign In",
      url: ROUTES.signIn,
    },
    {
      name: "Create Account",
      url: ROUTES.createAccount,
    },
  ],
};

/** Snackbar severities. Was MUI's AlertColor; the values are the same. */
export const SEVERITY = {
  success: "success",
  info: "info",
  warning: "warning",
  error: "error",
} as const;

export const MODAL_TYPE = ["button", "text", "custom", "link"] as const;


export const RATING_TYPE = {
  list: "list",
  create: "create",
  rating: "rating",
  edit: "edit",
  delete: "delete",
};

export const ACCOUNT_MENU_LIST =
  DROPDOWN_MENU[ACCOUNT_TYPE.user as keyof typeof DROPDOWN_MENU];

export const UserFriendSectionWindows = {
  create: "create",
  edit: "edit",
  list: "list",
};

/**
 * What a diner may suggest a change to.
 *
 * Kept in step with the server's `CORRECTABLE_DISH_FIELDS`, which refuses
 * anything else. Dietary flags are **deliberately absent**: they are the
 * biggest gap in the data and the one field where being wrong can hurt
 * somebody, so they are corrected by the kitchen or by nobody.
 */
export const CORRECTABLE_FIELDS = [
  { value: "name", label: "Name" },
  { value: "description", label: "Description" },
  { value: "price", label: "Price" },
  { value: "category", label: "Section" },
] as const;

/**
 * The three reports that are not a new value for a field.
 *
 * A field correction proposes a replacement and can be applied mechanically.
 * These say something about the dish as a whole, where the fix is a judgement
 * — approving one takes the dish off the menu, archives a duplicate, or
 * deliberately does nothing at all.
 *
 * `needsNote` is the difference that matters at the keyboard. "This is gone"
 * is complete on its own, and the reports worth having most are the ones
 * somebody makes while standing up to leave; demanding a sentence to go with
 * it turns a one-tap report into a form. "Something else" has no meaning
 * without one.
 */
export const CORRECTION_FLAGS = [
  {
    value: "availability",
    label: "No longer on the menu",
    needsNote: false,
    placeholder: "Anything to add? (optional)",
  },
  {
    value: "duplicate",
    label: "Listed twice",
    needsNote: false,
    placeholder: "Which other dish? (optional)",
  },
  {
    value: "other",
    label: "Something else",
    needsNote: true,
    placeholder: "What is wrong?",
  },
] as const;

export type CorrectionFlag = (typeof CORRECTION_FLAGS)[number]["value"];

/**
 * Deliberately not derived from the two lists above.
 *
 * Allergen and dietary fields are absent from both, and the reason is the
 * only one in this file worth stating twice: they are where being wrong can
 * hurt somebody, so they come from the kitchen or from nobody. A test asserts
 * no dietary field ever appears in either list.
 */
export const CORRECTION_FIELD_VALUES = [
  ...CORRECTABLE_FIELDS.map((one) => one.value),
  ...CORRECTION_FLAGS.map((one) => one.value),
] as readonly string[];

/**
 * Where a dish came from, as the server reports it. The frontend renders
 * these and computes nothing — same contract as reputation.
 */
export const DISH_SOURCE = {
  ai: "ai_extracted",
  community: "community",
  owner: "restaurant_owner",
  admin: "admin",
} as const;

export const DISH_VERIFICATION = {
  unverified: "unverified",
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  ownerVerified: "owner_verified",
} as const;

/** A dish sheet and a card show different amounts of the same truth. */
export const MENU_EDIT = {
  /** Longer than this and it is a description, not a name. */
  MAX_NAME: 120,
  MAX_DESCRIPTION: 600,
  MAX_SECTION: 60,
} as const;

/**
 * Writing to us. The lengths mirror the server's, which is what actually
 * enforces them — these only stop somebody typing four thousand characters
 * and then being told about it.
 */
export const CONTACT = {
  MAX_NAME: 120,
  MAX_SUBJECT: 160,
  MAX_MESSAGE: 4000,
  /** Shown when the form cannot send. Somewhere to go beats an apology. */
  FALLBACK_EMAIL: "info@whatsdatfood.com",
} as const;

/**
 * Waiting for a menu that is being prepared for the first time.
 *
 * Polled only while the server says something is running, so a restaurant
 * whose menu already exists costs one request and never asks again.
 */
export const MENU_WAIT = {
  POLL_MS: 3000,
  /**
   * When "this may take a few seconds" stops being true. Ten seconds is past
   * the point where a reader has decided something is wrong, and the second
   * message exists to tell them the rest of the page works.
   */
  SLOW_AFTER_MS: 10000,
} as const;
