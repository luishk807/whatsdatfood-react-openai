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
  manage: "/manage",
  admin: "/admin",
  privacy: "/privacy",
  terms: "/terms",
  notFound: "*",
} as const;

export const MENU_RESULTS_PARAM = "restaurant";

export const buildMenuResultsPath = (slug: string) =>
  ROUTES.menuResults.replace(`:${MENU_RESULTS_PARAM}`, slug);

export const PROFILE_PARAM = "username";

export const buildProfilePath = (username: string) =>
  ROUTES.profile.replace(`:${PROFILE_PARAM}`, encodeURIComponent(username));
