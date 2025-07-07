import { ReactNode, CSSProperties, ComponentType } from "react";
import { RestaurantType, MenuInterfaceItemType } from "@/types";
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
}

export interface ImageInterface {
  url?: string | null;
  alt?: string | null;
}

export interface MenuItemImageInterface<T> {
  data: T | null;
}
export interface SearchButtonInterface<T> {
  onSubmit: () => void;
  showLoading: boolean;
  data?: T | "";
}
