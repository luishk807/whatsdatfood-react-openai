import { ROUTES } from "@/customConstants/routes";

/**
 * The account menu, grouped rather than listed.
 *
 * It used to be seven items of identical weight - Setting, Friends, Ratings,
 * History, Favorites, Manage, Logout - which reads as a developer's route
 * list. Grouping says what belongs together, and the order says what this
 * product is for: the things you saved and looked at come first, account
 * utilities last.
 */
export const ACCOUNT_GROUPS = [
  {
    id: "yours",
    items: [
      // First in the group on purpose: it is the only entry that is about
      // what somebody has given rather than what they have kept.
      {
        label: "Your contributions",
        route: ROUTES.contributions,
        icon: "camera",
      },
      { label: "Favorites", route: ROUTES.favorites, icon: "heart" },
      { label: "History", route: ROUTES.history, icon: "clock" },
      // "Ratings" alone is ambiguous - whose?
      { label: "My ratings", route: ROUTES.ratings, icon: "star" },
      { label: "Friends", route: ROUTES.friends, icon: "people" },
    ],
  },
  {
    id: "owner",
    items: [
      // Not "Manage", which a diner cannot be expected to decode. Phrased as
      // a destination for owners, so it reads correctly whether or not the
      // reader has claimed anything yet.
      {
        label: "For restaurant owners",
        route: ROUTES.manage,
        icon: "storefront",
      },
    ],
  },
  {
    id: "account",
    items: [{ label: "Settings", route: ROUTES.settings, icon: "gear" }],
  },
] as const;

export const ACCOUNT_LABELS = {
  open: "Your account",
  close: "Close",
  signedInAs: "Signed in as",
  logOut: "Log out",
} as const;

export type AccountIcon = (typeof ACCOUNT_GROUPS)[number]["items"][number]["icon"];

export const ACCOUNT = {
  /** Ours, not the server's: the API accepts any password at all. */
  MIN_PASSWORD: 8,
} as const;
