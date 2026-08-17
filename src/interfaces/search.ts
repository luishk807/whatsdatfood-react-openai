import { RestaurantType } from "@/interfaces/restaurants";

export interface SearchSegment {
  text: string;
  /** True when this run matched what was typed. */
  match: boolean;
}

export interface SearchSuggestionsInterface {
  suggestions: RestaurantType[];
  query: string;
  show: boolean;
  /** Distinguishes "nothing matched" from "we have not looked yet". */
  searching: boolean;
  searched: boolean;
  /** Set when the lookup failed, as opposed to returning nothing. */
  error?: string | null;
  onSelect: (restaurant: RestaurantType) => void;
  onClose: () => void;
}
