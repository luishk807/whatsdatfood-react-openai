import { ReactNode, CSSProperties, ComponentType } from "react";
import {
  RestaurantType,
  MenuInterfaceItemType,
  SendFriendModalData,
} from "@/types";
import { LoadingType } from "@/types";
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
