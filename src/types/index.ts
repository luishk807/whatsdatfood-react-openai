import { FIELD_TYPES, LOADING_TYPES, ACCOUNT_TYPE } from "@/customConstants";
import { AlertColor } from "@mui/material";
import { dropDownMenuItemType, addressType } from "@/interfaces";
import {
  MODAL_TYPE,
  RATING_TYPE,
  UserFriendSectionWindows,
} from "@/customConstants";

export type FieldTypes = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

export type dropDownMenuKeyType =
  (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

export type ModalType = (typeof MODAL_TYPE)[number];

export type RatingToogleType = (typeof RATING_TYPE)[keyof typeof RATING_TYPE];

export type UserFriendSectionWindowTypes =
  (typeof UserFriendSectionWindows)[keyof typeof UserFriendSectionWindows];

export type dropDownMenuListType = Partial<
  Record<dropDownMenuKeyType, dropDownMenuItemType[]>
>;
export type LoadingType = (typeof LOADING_TYPES)[keyof typeof LOADING_TYPES];

export type getTypeFn = <T>(obj: object, flag: string, defaultValue?: T) => T;

export type getBuiltAddressType = (address: addressType) => string;

export type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";
