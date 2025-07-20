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
  username: "username",
} as const;
