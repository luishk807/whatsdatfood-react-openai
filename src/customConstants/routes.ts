export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  createAccount: "/create-account",
  logout: "/logout",
  account: "/account",
  friends: "/friends",
  settings: "/settings",
  ratings: "/ratings",
  contributions: "/contributions",
  profile: "/contributor/:username",
  history: "/history",
  favorites: "/favorites",
  menuResults: "/menu-results/:restaurant",
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
  manage: "/manage",
  admin: "/admin",
  privacy: "/privacy",
  terms: "/terms",
  notFound: "*",
} as const;

export const MENU_RESULTS_PARAM = "restaurant";

export const buildMenuResultsPath = (slug: string) =>
  ROUTES.menuResults.replace(`:${MENU_RESULTS_PARAM}`, slug);

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
