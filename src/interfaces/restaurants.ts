import { RecognitionType } from "@/interfaces/recognition";
import { UserRating } from "@/interfaces/users";
import { BusinessHours } from "@/interfaces/businessHours";

export interface ImageInterface {
  url?: string | null;
  alt?: string | null;
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
  /** Null means nobody has said. Never render that as a reassurance. */
  is_vegetarian?: boolean | null;
  is_vegan?: boolean | null;
  is_gluten_free?: boolean | null;
  contains_nuts?: boolean | null;
  contains_shellfish?: boolean | null;
  contains_dairy?: boolean | null;
  spice_level?: number | null;
  /** "owner" or "ai" — whose answer this is. */
  dietary_source?: string | null;
  /**
   * Who first photographed this dish. Recorded when it happened and never
   * rewritten, so it does not move when a later photo wins the hero slot —
   * those are two different facts and the product says both.
   */
  first_photographed_by?: string | null;
  /**
   * Where the row came from and what has since been established about it.
   * Two fields because they answer different questions — a dish a diner
   * added and the owner later confirmed is still community-sourced.
   */
  source?: string | null;
  verification_status?: string | null;
  /** Off the menu this week, not gone. Keeps its photos and its votes. */
  is_available?: boolean;
  /** The diner who added it. Null for the extracted majority. */
  added_by?: string | null;
  restaurant?: RestaurantType;
}

export interface RestCategoryMenu {
  [category: string]: MenuItemType[];
}

export interface RestaurantType {
  /**
   * Why this restaurant is worth attention, and who says so.
   *
   * The detail page shows every one; a card shows two. Empty for almost the
   * whole catalogue — nothing external is populated, and our own signals are
   * earned from activity rather than granted.
   */
  recognitions?: RecognitionType[] | null;
  id?: number;
  name: string;
  address?: string;
  city?: string;
  /**
   * Somebody manages this restaurant and an admin agreed.
   *
   * Not "has a claim": a claim is a request, and a mark that appeared on
   * submission would let anybody mark any restaurant verified by asking.
   */
  is_verified_business?: boolean;
  /** Ours, worked out from the coordinates. Null where it is not clear. */
  neighborhood?: string;
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
  /**
   * The most valuable contributor here, by Food Cred earned at this
   * restaurant. Null until somebody has earned any.
   */
  champion?: {
    username: string;
    display_name: string;
    cred: number;
  } | null;
  /** Denominator for the order share. */
  diner_count?: number;
  /**
   * Menu-level trust, said once under the restaurant's name rather than
   * badged onto every card. Null on both means nobody has ever vouched for
   * or touched this menu, which is true of almost every restaurant.
   */
  menu_verified_at?: string | null;
  menu_updated_at?: string | null;
  /**
   * Whether the viewer may open the management screen. Answered by the
   * server; hiding the link is not what protects the menu.
   */
  viewer_can_manage?: boolean;
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

