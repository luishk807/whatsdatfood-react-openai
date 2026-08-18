import { ReactNode, CSSProperties, ComponentType } from "react";
import { FieldTypes, ModalType, LoadingType, SeverityType } from "@/types";

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

export interface CustomModalInterface {
  children: ReactNode;
  customButton?: ReactNode;
  label?: string;
  type?: ModalType;
  closeOnParent?: boolean;
}
export interface TextFieldInterface<T> {
  label: string;
  name?: string;
  isError?: boolean;
  type?: string;
  isPlaceholder?: boolean;
  showLoader?: boolean;
  showLoaderElement?: ReactNode;
  defaultValue?: T;
  onChange: (value: string) => void;
}
export interface FormComponentInterface<T> {
  fields: FormFieldType[];
  title?: string;
  submitLabel?: string;
  showLoadingSubmit?: boolean;
  defaultValue?: T;
  onHandleSubmit: (data: any, e?: any) => void;
  onPrevious?: () => void;
}

export interface addressType {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
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

export interface CustomKeyPairObj<T> {
  label: string;
  value: T;
}

export interface snackBarObjType {
  open: boolean;
  message: string;
  severity: SeverityType;
}

export interface StatusType {
  id: number;
  name: string;
}

export interface dropDownMenuItemType {
  name: string;
  url: string;
}

export interface localTimeInt {
  [key: string]: string;
}
