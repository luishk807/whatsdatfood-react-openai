export const DEFAULT_CURRENCY = {
  code: "en-US",
  name: "USD",
};
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
  guest: "guest",
  user: "user",
  admin: "admin",
};

export const DROPDOWN_MENU = {
  user: [
    {
      name: "Account",
      url: "/account",
    },
    {
      name: "My Profile",
      url: "/profile",
    },
    {
      name: "Ratings",
      url: "/my-ratings",
    },
    {
      name: "Searches",
      url: "/search-history",
    },
    {
      name: "Logout",
      url: "",
    },
  ],
  guest: [
    {
      name: "Sign In",
      url: "/sign-in",
    },
    {
      name: "Create Account",
      url: "/create-account",
    },
  ],
};
