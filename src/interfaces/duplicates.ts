/** One of the two restaurants in a flagged pair, with everything needed to
 *  tell it from the other without opening a second tab. */
export interface DuplicateSideType {
  id: string;
  slug?: string | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  website?: string | null;
  place_type?: string | null;
  cuisine?: string | null;
  /** Two OSM objects for one shop is the commonest way a duplicate gets in. */
  osm_id?: string | null;
  menu_items?: number;
}

export interface DuplicatePairType {
  id: string;
  status: string;
  confidence: number;
  metres: number;
  /** How many addresses share this name. Shown, so an admin knows we knew. */
  chain_locations: number;
  reasons?: string | null;
  left?: DuplicateSideType | null;
  right?: DuplicateSideType | null;
}

export interface DuplicateQueueInterface {
  pairs: DuplicatePairType[];
  loading?: boolean;
  /** Which pair is mid-decision, so its buttons can be disabled. */
  busyId?: string | null;
  onResolve: (id: string, status: string) => void;
}
