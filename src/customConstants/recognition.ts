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

/** The word for our own family, said once where it needs saying. */
export const RECOGNITION_HOUSE_SOURCE = "What's Dat Food";
