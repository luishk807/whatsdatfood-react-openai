/**
 * The homepage discovery section.
 *
 * Every field mirrors a server type. The score behind the ordering is
 * deliberately not among them: it blends activity, distance and what we hold
 * about a place, and no honest caption can be written from it.
 */

export interface TrendingRestaurantType {
  id: string;
  slug?: string | null;
  name: string;
  neighborhood?: string | null;
  cuisine?: string | null;
  price_range?: string | null;
  distance_km: number;
  /** A community photograph or nothing. Stock imagery is barred here. */
  top_dish_name?: string | null;
  top_dish_photo_url?: string | null;
  photo_count: number;
  contributor_count: number;
}

export interface TrendingNearbyType {
  /** "trending" or "popular". The server decides which. */
  mode: "trending" | "popular";
  area_label?: string | null;
  restaurants: TrendingRestaurantType[];
  /** Null until something has earned it, which is the normal state of a
   *  fresh catalogue and must not be filled with whatever is nearest. */
  hot_pick?: TrendingRestaurantType | null;
}

export interface TrendingRestaurantsInterface {
  trending: TrendingNearbyType | null;
  loading?: boolean;
  /** Absent when nobody has chosen or granted a location yet. */
  hasLocation: boolean;
  onChangeLocation: () => void;
}

export interface HotPickInterface {
  pick?: TrendingRestaurantType | null;
  /** Governs the heading only. The card is identical either way. */
  mode: "trending" | "popular";
}

export interface TrendingCardInterface {
  restaurant: TrendingRestaurantType;
}

export interface DiscoveryAreaType {
  label: string;
  city?: string | null;
  latitude: number;
  longitude: number;
  source: string;
}
