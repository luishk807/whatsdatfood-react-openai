export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  createAccount: "/create-account",
  logout: "/logout",
  account: "/account",
  friends: "/friends",
  /**
   * Who you are and how to reach you.
   *
   * Called `settings` in the code and "Settings" on screen, and it was
   * neither: the page is a display name, a username, an email and a phone,
   * while the only actual setting — the theme — is a control in the account
   * drawer that never needed a page at all. So the route says what the page
   * holds.
   */
  accountProfile: "/account/profile",
  /** The old address, kept so existing links and bookmarks still land. */
  settings: "/settings",
  ratings: "/ratings",
  contributions: "/contributions",
  profile: "/contributor/:username",
  history: "/history",
  favorites: "/favorites",
  menuResults: "/menu-results/:restaurant",
  /**
   * The owner's view of their own menu. A route rather than an editing
   * toggle on the menu page, because the two audiences want different
   * layouts — not the same layout with extra buttons on it.
   *
   * The server refuses `ownerMenu` to anybody without an approved claim on
   * this restaurant, so typing somebody else's slug here returns an error
   * rather than their menu.
   */
  manageMenu: "/menu-results/:restaurant/manage",
  /**
   * Nearby discovery: a list and a map of what is around you.
   *
   * The location is a query parameter and never the path, and it is a place
   * name rather than coordinates: a shared link should say "Flushing", not
   * where somebody was standing when they sent it.
   */
  nearby: "/nearby",
  /** How Food Cred works, and the leaderboards. */
  rankings: "/rankings",
  /**
   * What somebody is into, permanently editable.
   *
   * A real route rather than a section buried in settings: the homepage
   * card is asked once and then never again, so this is where somebody
   * goes when their taste changes — and a one-line invitation on the front
   * door has to have somewhere to land.
   */
  tastes: "/account/tastes",

  /**
   * WhatsDatFood Pro. Every one of these redirects home unless the server
   * says this caller may see Pro — including the aliases, because somebody
   * guessing "/pricing" must not find the unfinished interface either.
   */
  pro: "/pro",
  pricing: "/pricing",
  upgrade: "/upgrade",
  subscription: "/account/subscription",
  manage: "/manage",
  admin: "/admin",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  notFound: "*",
} as const;

export const MENU_RESULTS_PARAM = "restaurant";

export const buildMenuResultsPath = (slug: string) =>
  ROUTES.menuResults.replace(`:${MENU_RESULTS_PARAM}`, slug);

export const buildManageMenuPath = (slug: string) =>
  ROUTES.manageMenu.replace(`:${MENU_RESULTS_PARAM}`, slug);

export const NEARBY_PARAMS = {
  cuisine: "cuisine",
  /** A place name — "Flushing", "10036". Never latitude and longitude. */
  place: "place",
  view: "view",
} as const;

export const buildNearbyPath = (
  options: { cuisine?: string; place?: string } = {},
) => {
  const params = new URLSearchParams();

  if (options.cuisine) {
    params.set(NEARBY_PARAMS.cuisine, options.cuisine);
  }

  if (options.place) {
    params.set(NEARBY_PARAMS.place, options.place);
  }

  const query = params.toString();

  return query ? `${ROUTES.nearby}?${query}` : ROUTES.nearby;
};

export const PROFILE_PARAM = "username";

export const buildProfilePath = (username: string) =>
  ROUTES.profile.replace(`:${PROFILE_PARAM}`, encodeURIComponent(username));
