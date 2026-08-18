/**
 * Contributor reputation, as the frontend needs it.
 *
 * The numbers and the level bands are **not** here. The server owns them, and
 * a copy in the browser is a second source of truth that goes stale the first
 * time the rules are tuned — and worse, invites a component to compute a level
 * the server never agreed to. Everything below is wording and presentation.
 */

/** Where a custom graphic goes when there is one. */
export const REPUTATION_ASSETS = {
  /**
   * Set to an imported image URL — `import mark from "@/assets/food-cred.svg"`
   * — and every Food Cred icon in the app becomes that file. Left null, the
   * component draws its placeholder instead. This is the whole swap: no
   * component changes, no layout changes, because `FoodCredIcon` already
   * reserves and fills the same box either way.
   */
  foodCred: null as string | null,
  /** Phase 2. Same contract. */
  champion: null as string | null,
  /** Phase 3. Keyed by badge id once badges exist. */
  badges: {} as Record<string, string>,
} as const;

export const FOOD_CRED_LABELS = {
  /**
   * Always "Food Cred", never "points", "coins" or "balance". It is a
   * reputation, and the moment it reads as a currency somebody asks what it is
   * worth.
   */
  unit: "Food Cred",
  total: "Food Cred",
  yourStanding: "Your contributions",
  history: "Food Cred history",
  historyEmpty: "Nothing yet. Add a photo of a dish and you are on the board.",
  photos: "Photos",
  dishes: "Dishes",
  restaurants: "Restaurants",
  /** e.g. "130 Food Cred until Local Foodie" */
  untilNext: (amount: number, level: string) =>
    `${amount} Food Cred until ${level}`,
  atTopLevel: "Top level reached",
  earned: (amount: number) => `+${amount} Food Cred`,
  lost: (amount: number) => `${amount} Food Cred`,
  removed: "Removed",
  dismiss: "Dismiss",
  firstDiscovery: "First dish discovery!",
  photoApproved: "Photo approved",
  viewHistory: "See how you earned this",
} as const;

/**
 * Event types, mirrored from the server so a component can switch on one
 * without a magic string. The server still decides what is awarded; this is
 * only how a row is read back.
 */
export const FOOD_CRED_EVENT = {
  photoApproved: "PHOTO_APPROVED",
  firstDishPhoto: "FIRST_DISH_PHOTO",
  firstRestaurantPhoto: "FIRST_RESTAURANT_PHOTO",
  photoBecamePrimary: "PHOTO_BECAME_PRIMARY",
  photoHelpful: "PHOTO_HELPFUL",
  dishIdentified: "DISH_IDENTIFIED",
  menuCorrectionApproved: "MENU_CORRECTION_APPROVED",
  validReport: "VALID_REPORT",
  spamPenalty: "SPAM_PENALTY",
  reversal: "REVERSAL",
} as const;

/** How long an award stays on screen before it gets out of the way. */
export const AWARD_VISIBLE_MS = 4500;
