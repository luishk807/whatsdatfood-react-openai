import { CoordinatesType } from "@/interfaces/location";

/**
 * What somebody is into.
 *
 * A category is identified by its `slug` and nothing else. There is no icon
 * field the browser is meant to trust — how `coffee` is drawn is decided in
 * `customConstants/foodIcons.tsx`, so replacing the artwork later never
 * touches anybody's saved preferences.
 */
export interface TasteCategoryType {
  slug: string;
  name: string;
  /** "food" or "cuisine" today. The server may invent another. */
  kind: string;
  display_order?: number | null;
  /** Almost always null; a hint for artwork the client cannot know about. */
  image_url?: string | null;
}

export interface TastePreferenceType {
  slug: string;
  name: string;
  kind: string;
  /** "explicit" — they said so — or "inferred", which nothing writes yet. */
  source: string;
}

/** Categories collected under their kind, in the server's order. */
export interface TasteGroupType {
  kind: string;
  categories: TasteCategoryType[];
}

export interface TastePreferencePickerInterface {
  categories: TasteCategoryType[];
  /** What is already chosen. The picker is controlled from here. */
  selected: string[];
  onChange: (slugs: string[]) => void;
  onSave: () => void;
  /**
   * Onboarding shows "Skip for now" and the explanation; account management
   * shows neither, because somebody who navigated to a settings page has
   * already decided to be there and can leave with the back button.
   */
  onSkip?: () => void;
  loading?: boolean;
  saving?: boolean;
  /** Shown verbatim. A save that fails silently looks like one that worked. */
  error?: string | null;
  saved?: boolean;
  /** Onboarding leads with the pitch; management leads with the list. */
  variant?: "onboarding" | "manage";
}

export interface TasteOnboardingInterface {
  /**
   * The question waits for somewhere to apply it. "Coffee near you" is a
   * promise the page cannot keep without a location, and asking before then
   * is asking before the reader has seen what the answer buys them.
   */
  hasLocation: boolean;
}

export interface TasteSectionsInterface {
  preferences: TastePreferenceType[];
  location: CoordinatesType | null;
  /** The area name, for a heading. Never an address. */
  place?: string | null;
}

export interface TasteSectionInterface {
  taste: TastePreferenceType;
  location: CoordinatesType | null;
}

export interface QuickDiscoveryInterface {
  /** Every category the server offers — the same list the picker renders. */
  categories: TasteCategoryType[];
  /** Saved tastes. They order the row; they never filter discovery. */
  preferences: TastePreferenceType[];
  loading?: boolean;
}

export interface TastePreferencesPageInterface {
  /**
   * Rendered inside Settings rather than as its own page.
   *
   * Drops the heading and the page padding, both of which the settings layout
   * already provides. The alternative was a second preferences page, and two
   * pickers that can disagree about which chips exist is the worst possible
   * thing to have two of.
   */
  embedded?: boolean;
}
