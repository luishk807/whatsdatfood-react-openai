import { UserRating } from "@/interfaces/users";

export interface MenuTitleInterface {
  restaurant: RestaurantType | null;
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

export interface MenuItemType {
  name: string;
  description: string;
  category: string;
  top_choice: boolean;
  price?: number;
  image?: string;
  ratings?: [UserRating];
}

export interface RestCategoryMenu {
  [category: string]: MenuItemType[];
}

export interface RestaurantType {
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
  michelin_score?: number;
  phone?: string;
  description?: string;
  delivery_method?: string;
  rating?: number;
  letter_grade?: string;
  updatedAt?: string;
  restaurantItems?: [MenuItemType];
}

export interface RestaurantItemImageType {
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
  restaurantItem?: MenuItemType;
}

export interface MenuInterfaceItemType {
  id: number;
  name: string;
  category: string;
  description: string;
  top_choice: boolean;
  image: string;
  price: number;
  restaurant?: RestaurantType;
}
