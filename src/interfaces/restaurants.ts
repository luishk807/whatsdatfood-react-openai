import { UserRating } from "@/interfaces/users";
import { BusinessHours } from "@/interfaces/businessHours";

export interface MenuTitleInterface {
  restaurant: RestaurantType | null;
}

export interface MenuItemInterface {
  item: MenuItemType;
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

/** A photo attached to a menu item, as returned nested in the menu query. */
export type MenuItemPhoto = Partial<RestaurantItemImageType>;

/**
 * The canonical dish shape. Fields are optional because that is what the API
 * actually guarantees — a dish may have no photo, no price and no votes.
 */
export interface MenuItemType {
  id?: number;
  name: string;
  description: string;
  category: string;
  top_choice: boolean;
  price?: number;
  image?: string;
  images?: MenuItemPhoto[];
  ratings?: UserRating[];
  /** Distinct people who said they ordered this. */
  order_count?: number;
  ordered_by_me?: boolean;
  restaurant?: RestaurantType;
}

export interface MenuItemItem {
  data: MenuItemType;
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
  /** Denominator for the order share. */
  diner_count?: number;
}

export interface RestaurantItemImageType {
  // GraphQL serialises ID as a string; `bigint` described the database column,
  // not what actually arrives over the wire.
  id?: string | number;
  /** "community" once someone uploads it; "stock" for image-search results. */
  source?: string;
  is_primary?: boolean;
  helpful_count?: number;
  restaurant_menu_item_id?: string | number;
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

/**
 * A dish once we know it came from the database and carries a photo — narrows
 * MenuItemType rather than restating it, so the two cannot drift apart again.
 */
export interface MenuInterfaceItemType extends MenuItemType {
  id: number;
  image: string;
  price: number;
}

export interface ShowRestaurantDetailI {
  data?: RestaurantType | null;
}

export interface RestaurantAmenitiesIconInt {
  restaurant: RestaurantType;
}
