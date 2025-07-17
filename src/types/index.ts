import { LOADING_TYPES } from "@/customConstants";
import { FIELD_TYPES } from "@/customConstants";

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

export type SuggestionComponentType<T extends { name: string }> = {
  onHandleSelection: (name: string, slug: string) => void;
  onClose: () => void;
  suggestions: T[];
  show: boolean;
  value: string;
};

export type FieldTypes = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

export type FormFieldType = {
  type: FieldTypes;
  name: string;
  label: string;
  placeholder?: boolean;
  isRequired?: boolean;
};

export type formCompValueType = {
  value: string;
  label: string;
  type: string;
};

export type formCompObjType = {
  [key: string]: formCompValueType;
};

export type LoadingType = (typeof LOADING_TYPES)[keyof typeof LOADING_TYPES];

export type getTypeFn = <T>(obj: object, flag: string, defaultValue?: T) => T;

export type getBuiltAddressType = (address: addressType) => string;
