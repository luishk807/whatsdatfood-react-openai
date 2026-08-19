import { FIELD_TYPES } from "@/customConstants";

// CREATE_ACCOUNT and SIGN_IN_FIELDS used to live here. Both auth pages are
// written out now rather than generated from a field list: they are two forms
// in the whole app, and generating them cost a shared password box, a shared
// reveal control and a shared idea of what a labelled input looks like.
export const CREATE_RATING = [
  {
    name: "rating",
    label: "Your Rating",
    isRequired: true,
    type: FIELD_TYPES.rating,
  },
  {
    name: "title",
    label: "Title",
    isRequired: true,
    type: FIELD_TYPES.textfield,
  },
  {
    name: "comment",
    label: "Comment",
    isRequired: true,
    type: FIELD_TYPES.textfield,
  },
];

export const CREATE_USER_FRIEND = [
  {
    name: "name",
    label: "Name",
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
    isRequired: true,
    type: FIELD_TYPES.textfield,
  },
];
