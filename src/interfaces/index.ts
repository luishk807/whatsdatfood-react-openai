import { ReactNode, CSSProperties, ComponentType } from "react";
import { LoadingType } from "@/types";
import { AlertColor } from "@mui/material";
import { FieldTypes } from "@/types";

export interface LoadingComponentInterface<T> {
  children: ReactNode;
  data?: T | null;
  type?: LoadingType;
  showLoading?: boolean;
  customLoader?: ComponentType;
}

export interface LoadingInterface {
  style?: CSSProperties;
  type?: LoadingType;
  customLoader?: ComponentType;
}

export interface SearchButtonInterface<T> {
  onSubmit: () => void;
  showLoading: boolean;
  data?: T | "";
}
export interface CustomModalInterface {
  children: ReactNode;
  customButton?: ReactNode;
  label?: string;
  closeOnParent?: boolean;
}
export interface SendFriendModalInterface {
  data?: SendFriendModalData | null;
}

export interface TextFieldInterface {
  label: string;
  name?: string;
  isError?: boolean;
  type?: string;
  isPlaceholder?: boolean;
  showLoader?: boolean;
  showLoaderElement?: ReactNode;
  onChange: (value: string) => void;
}
export interface FormComponentInterface {
  fields: FormFieldType[];
  title?: string;
  submitLabel?: string;
  onHandleSubmit: (data: any, e?: any) => void;
}

export interface addressType {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface MainSearchInputType {
  onChange: (search: string) => void;
  selectedValue: string;
}

export interface SendFriendModalData {
  restaurantName: string;
  address: string;
  itemName: string;
  price: string;
  image?: string;
}

export interface SuggestionComponentType<T extends { name: string }> {
  onHandleSelection: (name: string, slug: string) => void;
  onClose: () => void;
  suggestions: T[];
  show: boolean;
  value: string;
}

export interface FormFieldType {
  type: FieldTypes;
  name: string;
  label: string;
  placeholder?: boolean;
  isRequired?: boolean;
}

export interface formCompValueType {
  value: string;
  label: string;
  type: string;
}

export interface formCompObjType {
  [key: string]: formCompValueType;
}

export interface snackBarObjType {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface StatusType {
  id: number;
  name: string;
}

export interface dropDownMenuItemType {
  name: string;
  url: string;
}
