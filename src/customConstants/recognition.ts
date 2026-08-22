/**
 * Why a restaurant is worth paying attention to, and who says so.
 *
 * **Two families, and the distinction is the whole feature.** `official` is
 * somebody else's judgement — a guide with a name worth citing. `house` is
 * ours, earned from what this community has actually done. A badge that lets
 * our own ranking borrow a guide's authority is a lie about who is
 * recommending the place, and it is the kind a product only gets to tell
 * once. They are drawn in two visibly different treatments for that reason,
 * never in one row of identical pills.
 *
 * **The server sends the award, never the words.** The same rule the badge
 * shelf already follows: a slug is business data, a label is a rendering
 * decision that changes. Storing "★ Michelin 1 Star" would make rewording it
 * a migration over everybody's rows.
 *
 * **No logos.** Michelin's mark is theirs and we have not established that we
 * may use it. Stars are typographic — a character we are allowed to draw —
 * and every house signal is a word. Nothing here loads an image.
 *
 * **Never an emoji**, for the reason `FoodCredIcon` already gives: a different
 * picture on every platform, no theme colour, and unswappable without editing
 * every call site.
 */

export const RECOGNITION_KIND = {
  /** A guide, an award, a body worth citing. Not us. */
  official: "official",
  /** Ours, from stored activity. Never drawn as an award. */
  house: "house",
} as const;

export type RecognitionKindType =
  (typeof RECOGNITION_KIND)[keyof typeof RECOGNITION_KIND];

export const RECOGNITION_AWARD = {
  michelinOne: "michelin_1_star",
  michelinTwo: "michelin_2_star",
  michelinThree: "michelin_3_star",
  bibGourmand: "bib_gourmand",
  michelinSelected: "michelin_selected",
  mustVisit: "must_visit",
  trending: "trending",
  localFavourite: "local_favourite",
  topDish: "top_dish",
} as const;

export type RecognitionAwardType =
  (typeof RECOGNITION_AWARD)[keyof typeof RECOGNITION_AWARD];

/**
 * What each distinction is called, exactly.
 *
 * **A Bib Gourmand is not a star**, and Michelin Selected is not one either.
 * Collapsing the three into "Michelin" would put a claim on a card that the
 * guide did not make — which is the one thing a recognition badge cannot
 * survive doing.
 */
export const RECOGNITION_LABELS: Record<string, string> = {
  [RECOGNITION_AWARD.michelinOne]: "★ Michelin 1 Star",
  [RECOGNITION_AWARD.michelinTwo]: "★★ Michelin 2 Stars",
  [RECOGNITION_AWARD.michelinThree]: "★★★ Michelin 3 Stars",
  [RECOGNITION_AWARD.bibGourmand]: "Bib Gourmand",
  [RECOGNITION_AWARD.michelinSelected]: "Michelin Selected",
  [RECOGNITION_AWARD.mustVisit]: "Must Visit",
  [RECOGNITION_AWARD.trending]: "Trending",
  [RECOGNITION_AWARD.localFavourite]: "Local Favourite",
  [RECOGNITION_AWARD.topDish]: "Top Dish",
};

/**
 * Which distinction leads when a restaurant holds several.
 *
 * A card has room for one or two marks, not a wall of them. The order is
 * "hardest to earn first": a three-star restaurant is a three-star restaurant
 * before it is anything else, and our own signals sit below every external
 * one because a guide's judgement is the rarer claim.
 *
 * Anything unlisted sorts last rather than being dropped — a signal invented
 * on the server must not vanish silently from the page.
 */
export const RECOGNITION_PRIORITY: string[] = [
  RECOGNITION_AWARD.michelinThree,
  RECOGNITION_AWARD.michelinTwo,
  RECOGNITION_AWARD.michelinOne,
  RECOGNITION_AWARD.bibGourmand,
  RECOGNITION_AWARD.michelinSelected,
  RECOGNITION_AWARD.mustVisit,
  RECOGNITION_AWARD.trending,
  RECOGNITION_AWARD.localFavourite,
  RECOGNITION_AWARD.topDish,
];

/**
 * How many marks a card may show.
 *
 * Two. Past that the badges stop being a shortcut and become the card, and
 * the reader is back to reading everything — which is the problem recognition
 * exists to solve. The rest live on the restaurant's own page.
 */
export const RECOGNITION_CARD_LIMIT = 2;

/**
 * How many a restaurant's own page shows.
 *
 * All of them, effectively. A card is a glance and has room for two; this is
 * the screen somebody chose to open, and hiding a distinction here would mean
 * there is nowhere at all to read the full list.
 */
export const RECOGNITION_DETAIL_LIMIT = 8;

/** The word for our own family, said once where it needs saying. */
export const RECOGNITION_HOUSE_SOURCE = "What's Dat Food";

/**
 * Curation state. Only `verified` is ever public — the gate is enforced on
 * the server, and this exists so the admin list can say which is which.
 */
export const RECOGNITION_STATUS = {
  draft: "draft",
  pending: "pending_review",
  verified: "verified",
  expired: "expired",
  rejected: "rejected",
} as const;

/**
 * What an admin may award.
 *
 * Our own signals are absent on purpose: they are earned from stored activity
 * on every trending recompute, and a Must Visit typed by hand is exactly the
 * fabricated popularity this product refuses to invent.
 */
export const CURATABLE_AWARDS: string[] = [
  RECOGNITION_AWARD.michelinOne,
  RECOGNITION_AWARD.michelinTwo,
  RECOGNITION_AWARD.michelinThree,
  RECOGNITION_AWARD.bibGourmand,
  RECOGNITION_AWARD.michelinSelected,
];

/**
 * The admin section's words.
 *
 * **Never "Michelin verified".** The person checked a source and believes it
 * is currently accurate; they are not the guide, and we have no relationship
 * with the guide. "Admin verified" is the honest description of what happened.
 */
export const RECOGNITION_ADMIN_LABELS = {
  title: "Recognitions",
  loading: "Loading recognitions…",
  empty: "No recognitions recorded for this restaurant.",
  add: "+ Add recognition",
  award: "Recognition",
  provider: "Awarded by",
  reference: "Source you checked",
  year: "Guide year",
  notes: "Internal notes",
  save: "Save",
  cancel: "Cancel",
  verify: "Verify",
  unpublish: "Unpublish",
  expire: "Expire",
  source: "Open source",
  ours: "Earned from activity — recomputed automatically.",
  addingIsNotPublishing:
    "Saving records it. It stays hidden until somebody verifies it against the source.",
  lastChecked: (when: string) =>
    `Last checked ${new Date(when).toLocaleDateString()}`,
  status: (value: string) =>
    ({
      draft: "Not published",
      pending_review: "Waiting for review",
      verified: "Admin verified",
      expired: "Expired",
      rejected: "Rejected",
    })[value] ?? value,
  restaurant: "Restaurant slug",
  look: "Look up",
} as const;
