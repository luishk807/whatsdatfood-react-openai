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
  price?: number;
  image?: string;
};

export type getTypeFn = (obj: object, flag: string) => string;

export type getBuiltAddressType = (address: addressType) => string;
