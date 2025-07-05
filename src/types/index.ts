import { LOADING_TYPES } from "@/customConstants";

export type addressType = {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
};

export type MainSearchInputType = {
  onChange: (search: string) => void;
  selectedValue: string;
};

export type MenuItemType = {
  name: string;
  description: string;
  category: string;
  top_choice: boolean;
  price?: number;
  image?: string;
};

export type RestCategoryMenu = {
  [category: string]: MenuItemType[];
};

export type RestaurantType = {
  id?: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  deletedAt?: null;
  postal_code?: string;
  slug?: string;
  state?: string;
  updatedAt?: string;
  restRestaurantItems?: [MenuItemType];
};

export type MenuInterfaceItemType = {
  name: string;
  category: string;
  description: string;
  top_choice: boolean;
  image: string;
  price: number;
};

export type LoadingType = (typeof LOADING_TYPES)[keyof typeof LOADING_TYPES];

export type getTypeFn = <T>(obj: object, flag: string, defaultValue?: T) => T;

export type getBuiltAddressType = (address: addressType) => string;
