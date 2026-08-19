export interface CoordinatesType {
  latitude: number;
  longitude: number;
}

/** A point with a name for it. Never an address — see `area_label`. */
export interface ResolvedLocationType extends CoordinatesType {
  label: string;
}

export interface NearbyPlaceType extends Partial<CoordinatesType> {
  id: string;
  slug?: string | null;
  name: string;
  address?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  /** Null for most restaurants: the classifier refuses to guess. */
  cuisine?: string | null;
  price_range?: string | null;
  distance_km: number;
  /** Absent unless a diner has photographed something there. */
  top_dish_name?: string | null;
  top_dish_photo_url?: string | null;
}

export interface TrendingDishType {
  dish_id: string;
  dish_name: string;
  restaurant_name: string;
  restaurant_slug?: string | null;
  distance_km: number;
  photo_url?: string | null;
  photo_thumb_url?: string | null;
  photographer?: string | null;
  score: number;
  photo_count: number;
  vote_count: number;
  contributor_count: number;
}

export interface DishNeedingPhotoType {
  dish_id: string;
  dish_name: string;
  restaurant_name: string;
  restaurant_slug?: string | null;
  distance_km: number;
}

/**
 * The homepage strip. The server picks the mode, because the threshold for
 * "enough activity to call this trending" is a rule about the data and a copy
 * of it here would be a second source of truth.
 */
export interface NearbyDiscoveryType {
  area_label?: string | null;
  mode: "trending" | "contribute";
  trending: TrendingDishType[];
  needs_photos: DishNeedingPhotoType[];
}

export interface LocationCueInterface {
  /** Carried through to the results, so "Chinese" plus a location is one tap. */
  cuisine?: string;
}

export interface TrendingStripInterface {
  discovery: NearbyDiscoveryType | null;
  loading?: boolean;
  /** Absent when nobody has chosen or granted a location yet. */
  hasLocation: boolean;
  onChangeLocation: () => void;
}

export interface NearbyListInterface {
  places: NearbyPlaceType[];
  loading?: boolean;
  /** The pin the reader tapped on the map, so the row can answer it. */
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export interface RestaurantMapInterface {
  places: NearbyPlaceType[];
  centre: CoordinatesType;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** "Search this area", once the map has been moved. */
  onSearchArea?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  onRecentre?: () => void;
}
