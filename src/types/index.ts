import { FIELD_TYPES, LOADING_TYPES, ACCOUNT_TYPE } from "@/customConstants";
import { AlertColor } from "@mui/material";
import { dropDownMenuItemType, addressType } from "@/interfaces";

export type FieldTypes = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

export type dropDownMenuKeyType =
  (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

export type dropDownMenuListType = Partial<
  Record<dropDownMenuKeyType, dropDownMenuItemType[]>
>;
export type LoadingType = (typeof LOADING_TYPES)[keyof typeof LOADING_TYPES];

export type getTypeFn = <T>(obj: object, flag: string, defaultValue?: T) => T;

export type getBuiltAddressType = (address: addressType) => string;
