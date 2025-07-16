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

export type SendFriendModalData = {
  restaurantName: string;
  address: string;
  itemName: string;
  price: string;
  image?: string;
};

export type LoadingType = (typeof LOADING_TYPES)[keyof typeof LOADING_TYPES];

export type getTypeFn = <T>(obj: object, flag: string, defaultValue?: T) => T;

export type getBuiltAddressType = (address: addressType) => string;
