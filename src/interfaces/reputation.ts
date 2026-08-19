import { FOOD_CRED_EVENT } from "@/customConstants/reputation";

export type FoodCredEventType =
  (typeof FOOD_CRED_EVENT)[keyof typeof FOOD_CRED_EVENT];

/** A band of lifetime Food Cred. Always server-computed. */
export interface ContributorLevelType {
  key: string;
  name: string;
  /** Where this band starts — the bar fills from here, not from zero. */
  floor: number;
  next_name: string | null;
  next_at: number | null;
  cred_to_next: number;
  /** 0–1 across the current band. */
  progress: number;
}

export interface FoodCredEventItemType {
  id: string;
  event_type: FoodCredEventType | string;
  points: number;
  label: string | null;
  dish_name: string | null;
  restaurant_name: string | null;
  restaurant_slug: string | null;
  photo_url: string | null;
  /** The contribution was taken down. The row stays, so the drop is explained. */
  reversed: boolean;
  createdAt: string | null;
}

export interface ContributorStatsType {
  food_cred: number;
  level: ContributorLevelType | null;
  photo_count: number;
  dish_count: number;
  restaurant_count: number;
  badges?: BadgeType[];
}

export interface ContributorProfileType extends ContributorStatsType {
  username: string;
  display_name: string;
  joinedAt: string | null;
}

/** One line of "what you just earned", straight from the upload response. */
export interface FoodCredAwardType {
  type: FoodCredEventType | string;
  points: number;
  label: string;
}

export interface FoodCredEarnedType {
  earned: number;
  events: FoodCredAwardType[];
}

// --- component props ------------------------------------------------------

export interface FoodCredIconInterface {
  /** px. Matches the surrounding text size rather than dictating it. */
  size?: number;
  className?: string;
}

export interface FoodCredAmountInterface {
  amount: number;
  /** Renders "+10" rather than "10" — for feedback, not for totals. */
  signed?: boolean;
  size?: "sm" | "md" | "lg";
  /** Muted, for a row that has been reversed. */
  muted?: boolean;
  className?: string;
}

export interface LevelProgressInterface {
  level: ContributorLevelType;
  foodCred: number;
  /** Hides the caption on a tight row like a card. */
  compact?: boolean;
}

export interface ContributorSummaryInterface {
  name: string;
  stats: ContributorStatsType;
  /** Shown under the name — "Joined March 2026", or a level on a public page. */
  subtitle?: string;
}

export interface FoodCredHistoryInterface {
  events: FoodCredEventItemType[];
  loading?: boolean;
}

export interface FoodCredAwardInterface {
  award: FoodCredEarnedType | null;
  onDismiss: () => void;
}

/**
 * One person's place in a scope — a leaderboard row, or a Champion.
 *
 * Deliberately not a user object. A leaderboard is public and the user type
 * carries an email and a phone; the safe shape is one that never had them.
 */
export interface StandingType {
  username: string;
  display_name: string;
  cred: number;
}

export interface TopContributorsInterface {
  standings: StandingType[];
  champion?: StandingType | null;
  loading?: boolean;
  /** Opens the full list. Absent while the leaderboard fits on screen. */
  onViewAll?: () => void;
}

export interface ChampionIconInterface {
  size?: number;
  className?: string;
}

/**
 * A badge, earned or in progress.
 *
 * `icon` is a key the server chose, not a URL. `BadgeIcon` maps it to an asset,
 * so replacing the artwork never touches the API.
 */
export interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Null until earned. Its presence is what "earned" means. */
  earnedAt: string | null;
  progress: number;
  target: number;
}

export interface BadgeIconInterface {
  badgeId: string;
  earned?: boolean;
  size?: number;
  className?: string;
}

export interface BadgeGridInterface {
  badges: BadgeType[];
  /** Hides progress on someone else's profile — their progress is theirs. */
  showProgress?: boolean;
}
