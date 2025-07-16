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

export type RestaurantItemImageType = {
  id?: bigint;
  restaurant_menu_item_id: bigint;
  name?: string;
  url_m?: string;
  url_s?: string;
  owner?: string;
  license?: string;
  context_link?: string;
  category?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  restaurantItemImageRestItem?: MenuItemType;
};

export type MenuInterfaceItemType = {
  id: number;
  name: string;
  category: string;
  description: string;
  top_choice: boolean;
  image: string;
  price: number;
  restaurantItemImageRestItem?: RestaurantItemImageType;
};
