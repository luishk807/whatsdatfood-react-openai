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
  /**
   * The row being pointed at, which is a preview and not a choice.
   *
   * Separate from `selectedId` on purpose: a selection has to survive the
   * pointer moving on, or clicking a pin and then reading down the list
   * would silently discard what the reader picked.
   */
  hoveredId?: string | null;
  /** Null on the way out — the row was left, and nothing is being previewed. */
  onHover?: (id: string | null) => void;
  /**
   * Bring this row into view, because the reader asked for it somewhere the
   * row is not: a pin on the map. Never set from anything the list itself
   * did — scrolling the list out from under a pointer that is moving down it
   * is how a list starts fighting the person reading it.
   */
  scrollToId?: string | null;
  /**
   * The category being filtered on, already in display form.
   *
   * Only the empty state uses it, and only to stop blaming the neighbourhood
   * for a filter: "no coffee around here" and "no restaurants around here"
   * are different facts and lead to different next moves.
   */
  filterLabel?: string;
  /** Where "show everything nearby" goes — the same page without the filter. */
  clearFilterHref?: string;
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
  /** Null clears it — tapping the map off a pin is how a selection is undone. */
  onSelect?: (id: string | null) => void;
  /**
   * The restaurant being pointed at in the list beside the map.
   *
   * Drawn, never navigated to: it emphasises a pin, draws one for a place
   * hidden in a cluster, and moves the camera only when the place is not
   * already comfortably on screen. The zoom the reader chose is never
   * changed by it.
   */
  hoveredId?: string | null;
  /** A pin was pointed at, so the row in the list can answer. */
  onHover?: (id: string | null) => void;
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
