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
  onAddPhoto?: () => void;
  /** Fires once when a photo-less tile scrolls into view. */
  onVisible?: () => void;
}

export interface VoteButtonInterface {
  value?: VoteValue | null;
  upCount?: number;
  disabled?: boolean;
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
  onAddPhoto?: (item: MenuItemType) => void;
  /** Fires once when a dish with no photo scrolls into view. */
  onVisible?: (item: MenuItemType) => void;
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
}
