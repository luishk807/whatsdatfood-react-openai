import { FIELD_TYPES } from "@/customConstants";
export const CREATE_ACCOUNT = [
  {
    name: "first_name",
    label: "First Name",
    isRequired: true,
    type: FIELD_TYPES.textfield,
  },
  {
    name: "last_name",
    label: "Last Name",
    isRequired: true,
    type: FIELD_TYPES.textfield,
  },
  {
    name: "email",
    label: "Email",
    isRequired: true,
    type: FIELD_TYPES.email,
  },
  {
    name: "phone",
    label: "Phone",
    type: FIELD_TYPES.textfield,
  },
  {
    name: "dob",
    label: "Date of birth",
    isRequired: true,
    type: FIELD_TYPES.date,
  },
  {
    name: "username",
    label: "Username",
    isRequired: true,
    type: FIELD_TYPES.username,
  },
  {
    name: "password",
    label: "Password",
    isRequired: true,
    type: FIELD_TYPES.password,
  },
  {
    name: "confirm_password",
    label: "Confirm Password",
    isRequired: true,
    type: FIELD_TYPES.password,
  },
];

export const SIGN_IN_FIELDS = [
  {
    name: "username",
    label: "Username",
    isRequired: true,
    type: FIELD_TYPES.textfield,
  },
  {
    name: "password",
    label: "Password",
    isRequired: true,
    type: FIELD_TYPES.password,
  },
];
