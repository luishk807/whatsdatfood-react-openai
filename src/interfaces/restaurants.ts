import { UserRating } from "@/interfaces/users";
import { BusinessHours } from "@/interfaces/businessHours";

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
  id?: number;
  name: string;
  description: string;
  category: string;
  top_choice: boolean;
  price?: number;
  image?: string;
  ratings?: UserRating[];
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
  payment_method?: string;
  rating?: number;
  letter_grade?: string;
  updatedAt?: string;
  website?: string;
  email?: string;
  tasting_menu_only?: boolean;
  tasting_menu_price?: number;
  price_range?: string;
  drink_pairing_price?: number;
  reservation_required?: boolean;
  reservation_available?: boolean;
  parking_available?: boolean;
  cash_only?: boolean;
  card_payment?: boolean;
  drive_through?: boolean;
  delivery_option?: boolean;
  businessHours: BusinessHours[];
  restaurantItems?: MenuItemType[];
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

export interface ShowRestaurantDetailI {
  data?: RestaurantType | null;
}

export interface RestaurantAmenitiesIconInt {
  restaurant: RestaurantType;
}
