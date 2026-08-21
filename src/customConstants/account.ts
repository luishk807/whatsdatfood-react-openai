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
      // Last in the group, and permanent. The homepage asks once and then
      // never again; this is where somebody comes when their taste changes,
      // and where the quiet invitation on the front door lands.
      { label: "Taste preferences", route: ROUTES.tastes, icon: "utensils" },
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
  // There is no "account" group any more. It held one row, "Settings", whose
  // page is a display name, a username, an email and a phone — identity, not
  // settings. It is reached from the profile header at the top of the drawer,
  // which is where somebody looks for their own account, and the one real
  // setting is the appearance control below.
  {
    /**
     * Admins only, and the reason this group exists at all: `/admin` was
     * reachable by typing the URL and by nothing else, so the queues that
     * decide whether a reported photo stays had no way in from the app. The
     * one person who can work them is the one person who was never shown the
     * door.
     */
    id: "admin",
    adminOnly: true,
    items: [{ label: "Review queue", route: ROUTES.admin, icon: "gear" }],
  },
] as const;

export const ACCOUNT_LABELS = {
  open: "Your account",
  /**
   * The header is the way into the account itself.
   *
   * It used to be two lines of dead text over a menu whose last row was a
   * gear marked "Settings" — so the one place a reader looks for themselves
   * was the one place that did nothing, and the page about them was filed
   * under a word for something else.
   */
  viewProfile: "View profile & account",
  /**
   * Signed out. The same control, because a visitor tapping the person icon
   * wants either to sign in or to change the theme, and both live behind it.
   */
  openSignedOut: "Sign in or change appearance",
  close: "Close",
  signedInAs: "Signed in as",
  logOut: "Log out",
  /**
   * The theme lives here rather than in the header.
   *
   * It used to be a second icon in the bar, kept there on the argument that a
   * signed-out visitor has no account menu and would lose it — which was true
   * of a menu only signed-in people could open. The menu opens for everybody
   * now, so the argument is spent and the header is down to one control.
   */
  appearance: "Appearance",
  signIn: "Sign in",
  createAccount: "Create account",
} as const;

export type AccountIcon = (typeof ACCOUNT_GROUPS)[number]["items"][number]["icon"];

export const ACCOUNT = {
  /**
   * Said under the field before anything is typed, so nobody meets this rule
   * for the first time as a rejection.
   *
   * The server enforces it too — `MIN_PASSWORD_LENGTH` in
   * `app/services/users.py`, which is what actually decides. Keep the two in
   * step; this one only saves a round trip.
   */
  MIN_PASSWORD: 8,
} as const;
