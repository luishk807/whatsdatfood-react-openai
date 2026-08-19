export interface SearchSegment {
  text: string;
  /** True when this run matched what was typed. */
  match: boolean;
}

export interface SearchSuggestionsInterface {
  suggestions: RestaurantSuggestionType[];
  query: string;
  show: boolean;
  /** Distinguishes "nothing matched" from "we have not looked yet". */
  searching: boolean;
  searched: boolean;
  /** Set when the lookup failed, as opposed to returning nothing. */
  error?: string | null;
  onSelect: (suggestion: RestaurantSuggestionType) => void;
  onClose: () => void;
  /** Set while a chosen suggestion is being imported. */
  resolving?: boolean;
}

/**
 * A row in the restaurant type-ahead, from either source.
 *
 * Two kinds, and the difference is worth showing: `slug` means we already hold
 * this restaurant and its menu is one navigation away; `place_id` means we do
 * not, and choosing it imports it — the one call in the session that costs
 * anything.
 */
export interface RestaurantSuggestionType {
  name: string;
  address: string;
  slug?: string | null;
  place_id?: string | null;
  /** Whether this product already has a menu for it. */
  known: boolean;
}
