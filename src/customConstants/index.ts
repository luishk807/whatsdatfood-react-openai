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
      name: "Setting",
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

export const MODAL_TYPE = ["button", "text", "custom", "link"] as const;

export const RESTAURANT_AMENITIES_OPTIONS = [
  "parking_available",
  "cash_only",
  "card_payment",
  "delivery_option",
  "reservation_required",
  "reservation_available",
  "drive_through",
  "delivery_option",
];

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
