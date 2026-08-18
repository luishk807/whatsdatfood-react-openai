import { ReactNode } from "react";
import { MenuItemType } from "@/interfaces/restaurants";
import { VoteValue, ImageSourceType, BadgeToneType } from "@/types";

/**
 * A dish's standing within one restaurant. Scores are only comparable between
 * dishes of the same restaurant, because the prior is that restaurant's mean.
 */
export interface DishScore {
  id: number;
  /** Shrunk score used for ordering. */
  score: number;
  /** Raw mean, kept separate because it is what we show, not what we sort by. */
  average: number;
  voteCount: number;
  /** False while the dish has too few votes to be ranked honestly. */
  isRanked: boolean;
}

export type DishScoreMap = Record<number, DishScore>;

export interface BadgeInterface {
  children: ReactNode;
  tone?: BadgeToneType;
  className?: string;
}

export interface DishPhotoInterface {
  url?: string | null;
  alt?: string | null;
  source?: ImageSourceType;
  /** Skips lazy loading for the handful of photos above the fold. */
  eager?: boolean;
  /** Receives the chosen file; the tile owns the picker so the camera is one tap. */
  onAddPhoto?: (file: File) => void;
  /** Fires once when a photo-less tile scrolls into view. */
  onVisible?: () => void;
  /**
   * Fires when there is nothing to show — no URL, or the host refused it.
   * Third-party photo hosts 403 often enough that this is a normal case, and a
   * caller that has nothing to offer in place of a photo can drop the tile.
   */
  onUnavailable?: () => void;
  /** Username to credit, shown on community photos. */
  credit?: string | null;
  uploading?: boolean;
  /**
   * A small tile — a card in the top strip, not a menu row. Shortens the ask
   * so it stays one legible line rather than wrapping to four words a side.
   */
  compact?: boolean;
}

export interface VoteButtonInterface {
  value?: VoteValue | null;
  upCount?: number;
  disabled?: boolean;
  /** One control on a card; both on the detail sheet, where there is room. */
  compact?: boolean;
  /**
   * The number worth reading beside the thumb — "94%" once a dish has enough
   * votes to have a share, otherwise the raw count. Voting is the product's
   * ranking mechanism, so on a card this is information first and a control
   * second; a bare pale icon in the corner said nothing at all.
   */
  metric?: string;
  onVote?: (value: VoteValue) => void;
}

export interface DishCardInterface {
  item: MenuItemType;
  score?: DishScore;
  vote?: VoteValue | null;
  eager?: boolean;
  canVote?: boolean;
  onVote?: (item: MenuItemType, value: VoteValue) => void;
  onOpen?: (item: MenuItemType) => void;
  onAddPhoto?: (item: MenuItemType, file: File) => void;
  /** Fires once when a dish with no photo scrolls into view. */
  onVisible?: (item: MenuItemType) => void;
  /** Dish currently being uploaded, so the tile can show progress. */
  uploadingDishId?: number | null;
  /** Denominator for the order share, from the restaurant. */
  dinerCount?: number;
  /**
   * Suppresses the "most loved" badge. Inside the strip of most-loved dishes the
   * badge repeats the section heading on every card, and stacks on top of the
   * stock-photo disclosure in the same corner.
   */
  hideRankBadge?: boolean;
}

export interface DishGridInterface
  extends Omit<DishCardInterface, "item" | "score" | "vote" | "eager"> {
  items: MenuItemType[];
  scores?: DishScoreMap;
  votes?: Record<number, VoteValue | null>;
  /** How many leading cards load eagerly. */
  eagerCount?: number;
}

export interface TopDishStripInterface
  extends Omit<DishGridInterface, "eagerCount"> {
  title?: string;
  subtitle?: string;
  /** Anchor for the sticky category bar to jump to. */
  id?: string;
}

/**
 * One photo on the homepage wall, as the server sends it.
 *
 * A photo on its own is decoration, so every tile carries the dish it shows,
 * the restaurant it belongs to and the slug to follow.
 */
export interface ShowcasePhoto {
  id?: string | null;
  url_s?: string | null;
  url_m?: string | null;
  dish_name?: string | null;
  restaurant_name?: string | null;
  restaurant_slug?: string | null;
  owner?: string | null;
}

export interface PhotoWallInterface {
  photos: ShowcasePhoto[];
  loading?: boolean;
  /** How many tiles skip lazy loading; the rest are below the fold. */
  eagerCount?: number;
}

/** One jump target in the sticky category bar. */
export interface MenuSection {
  /** Stable id used for the anchor and for scroll tracking. */
  id: string;
  label: string;
}

export interface CategoryNavInterface {
  sections: MenuSection[];
  /** Which section the reader is currently inside. */
  activeId?: string | null;
  onJump: (id: string) => void;
}
