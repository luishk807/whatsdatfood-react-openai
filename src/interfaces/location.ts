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
  /**
   * What this community has actually done here. Facts, both of them — never a
   * star rating out of somebody else's database, and never a rounded-up claim
   * about how popular somewhere is. Zero is a real answer, and the card says
   * "no dish photos yet" rather than hiding the row.
   */
  photo_count?: number | null;
  contributor_count?: number | null;
  /** Where a card's picture may come from — see `utils/restaurantImage`. */
  owner_photo_url?: string | null;
  google_photo_url?: string | null;
  google_photo_attribution?: string | null;
  google_photo_attribution_url?: string | null;
  logo_url?: string | null;
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
  /**
   * Whether a new location should send the reader to `/nearby`.
   *
   * True where this is a way *in* — the front door's own prompt. False where
   * it is a way to *change* the location of sections already on screen, as on
   * the home page: navigating away there meant the sections never visibly
   * updated, and somebody who had just moved cities read the old area name
   * again when they came back.
   */
  navigateOnFix?: boolean;
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

/** What the map hands back when the reader asks to search where they are
 * looking. The shape the existing `restaurantsInArea` query already takes. */
export interface MapBoundsType {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface RestaurantMapInterface {
  places: NearbyPlaceType[];
  centre: CoordinatesType;
  /**
   * Draw the "you are here" dot. Only for a measured fix — a typed place is
   * an area, and a dot in the middle of Flushing claims a precision nobody
   * gave us.
   */
  showMe?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** "Search this area", once the map has been moved far enough to matter. */
  onSearchArea?: (bounds: MapBoundsType) => void;
  onRecentre?: () => void;
}

export interface RestaurantPreviewInterface {
  /** Null when no pin is selected, so the card is one conditional, not two. */
  place: NearbyPlaceType | null;
  onClose: () => void;
}

export interface LocationSheetInterface {
  open: boolean;
  onClose: () => void;
}

export interface LocationBadgeInterface {
  /** The area name. Empty until the server has named it — never an address. */
  label?: string | null;
  onChange: () => void;
}

/**
 * Pins grouped for the zoom they are about to be drawn at.
 *
 * A lone restaurant is a cluster of one, so the map has a single list to
 * render and cannot draw the same place twice.
 */
export interface PlaceClusterType {
  id: string;
  latitude: number;
  longitude: number;
  places: NearbyPlaceType[];
}
