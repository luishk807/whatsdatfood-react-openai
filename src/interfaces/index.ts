import { ReactNode, CSSProperties, ComponentType } from "react";
import { RestaurantType, MenuInterfaceItemType } from "@/types/restaurants";
import { LoadingType, FormFieldType, SendFriendModalData } from "@/types";
export interface RequestAIInterface {
  restaurant: string;
  address?: string;
}

export interface MenuTitleInterface {
  restaurant: RestaurantType | null;
}

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

export interface MenuItemInterface {
  item: MenuInterfaceItemType;
  restaurant?: RestaurantType | null;
}

export interface ImageInterface {
  url?: string | null;
  alt?: string | null;
}

export interface MenuItemImageInterface<T> {
  data: T | null;
  onImageChange?: (newImage: string) => void;
}
export interface SearchButtonInterface<T> {
  onSubmit: () => void;
  showLoading: boolean;
  data?: T | "";
}

export interface CustomModalInterface {
  children: ReactNode;
  label?: string;
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
  onHandleSubmit: (data: any) => void;
}
