export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  createAccount: "/create-account",
  logout: "/logout",
  account: "/account",
  friends: "/friends",
  settings: "/settings",
  ratings: "/ratings",
  history: "/history",
  favorites: "/favorites",
  menuResults: "/menu-results/:restaurant",
  notFound: "*",
} as const;

export const MENU_RESULTS_PARAM = "restaurant";

export const buildMenuResultsPath = (slug: string) =>
  ROUTES.menuResults.replace(`:${MENU_RESULTS_PARAM}`, slug);
