import { FIELD_TYPES, LOADING_TYPES, ACCOUNT_TYPE } from "@/customConstants";
import { AlertColor } from "@mui/material";
import { dropDownMenuItemType, addressType } from "@/interfaces";
import {
  MODAL_TYPE,
  RATING_TYPE,
  UserFriendSectionWindows,
} from "@/customConstants";
import { VOTE } from "@/customConstants/ranking";
import { THEME } from "@/customConstants/theme";
import { IMAGE_SOURCE, BADGE_TONE } from "@/customConstants/images";

export type VoteValue = (typeof VOTE)[keyof typeof VOTE];

/** What the viewer asked for, including deferring to their OS. */
export type ThemePreference = (typeof THEME)[keyof typeof THEME];

/** What is actually rendered; "system" has been resolved away. */
export type ResolvedTheme = typeof THEME.light | typeof THEME.dark;

export type ImageSourceType = (typeof IMAGE_SOURCE)[keyof typeof IMAGE_SOURCE];

export type BadgeToneType = (typeof BADGE_TONE)[keyof typeof BADGE_TONE];

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
