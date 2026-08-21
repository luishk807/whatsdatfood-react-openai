/**
 * Photos come from many sources and arrive in every aspect ratio, so the grid
 * locks them to one shape rather than letting each photo set its own height.
 */
export const IMAGE = {
  ASPECT_RATIO: "1 / 1",
  /** Longest edge a phone photo is resized to before upload. */
  MAX_UPLOAD_EDGE: 1600,
  /** Smallest edge worth showing at all. */
  MIN_USABLE_EDGE: 150,
} as const;

/**
 * Where a photo came from, and the line the product depends on.
 *
 * A photograph shown under a restaurant's name is a claim about what that
 * kitchen serves, and only a diner can make it. The server no longer serves
 * `stock` for a dish at all — existing rows stay in the database and stop
 * being returned — so `community` is the only source a dish photo arrives
 * with today.
 *
 * `stock` remains here because stored rows still carry it and the badge must
 * keep rendering correctly if a deployment turns the old behaviour back on.
 *
 * `generic` is the separate thing: cuisine tiles, homepage inspiration, the
 * food beside the sign-in form. It illustrates an idea rather than asserting
 * what a particular kitchen plated, it is never attached to a dish, and
 * `DishPhoto` refuses to render it — the two must not be confusable, because
 * the moment a reader cannot tell them apart neither one is worth anything.
 */
export const IMAGE_SOURCE = {
  community: "community",
  stock: "stock",
  generic: "generic",
} as const;

/**
 * Where the picture on a restaurant card came from.
 *
 * A superset of `IMAGE_SOURCE`, which describes a *dish* photograph. A card
 * has more places to look — an owner's cover shot, a Google Places photo, a
 * logo — and the distinction has to survive all the way to the rendered
 * element, because the rules about each are different: Google imagery carries
 * an attribution we are obliged to display, and community work is the thing
 * this product is actually built on.
 *
 * `fallback` is not a photograph and never pretends to be one. It is our own
 * artwork, drawn from the restaurant's cuisine.
 */
export const COVER_SOURCE = {
  community: "community",
  owner: "owner",
  google: "google",
  logo: "logo",
  fallback: "fallback",
} as const;

/**
 * What is filling a large decorative panel.
 *
 * Separate from `COVER_SOURCE`, which describes a card: a hero is allowed to
 * be decoration, and a card under a restaurant's name is not. The two never
 * share a value so a panel image can never be mistaken for evidence about a
 * kitchen.
 */
export const HERO_SOURCE = {
  /** A diner's photograph. Captioned with the dish and who took it. */
  community: "community",
  /** Curated Unsplash. Credited, never captioned with a dish. */
  curated: "curated",
} as const;

export type HeroSource = (typeof HERO_SOURCE)[keyof typeof HERO_SOURCE];

/**
 * How many community photographs the hero asks for.
 *
 * More than one because it rotates on the day, and because a third-party
 * refusal should be covered by the next photo rather than dropping to the
 * fallback. Still a bounded handful: this is decoration.
 */
export const HERO_POOL = 12;

export type CoverSource = (typeof COVER_SOURCE)[keyof typeof COVER_SOURCE];

/**
 * Widths asked for by a card, so a 140px tile does not download a 1600px
 * photograph. Google's photo endpoint takes a maximum edge; our own storage
 * already keeps a small and a medium rendition.
 */
export const COVER_WIDTH = {
  tile: 400,
  card: 640,
  hero: 1200,
} as const;

/**
 * The visibility-driven photo lookup.
 *
 * Dormant. The server no longer searches for dish photography, so every one of
 * these requests would return null — a round trip per dish to be told what the
 * empty tile already says. `MenuResults` no longer calls it.
 *
 * Kept, along with the hook, because the budget and the negative cache are the
 * expensive lessons: every dish firing a lookup on every load is what made one
 * page view cost 21 image searches. If placeholder imagery is ever wanted
 * again, it is re-enabled here rather than rediscovered.
 */
export const PHOTO_LOOKUP = {
  MAX_PER_PAGE_VIEW: 6,
  ROOT_MARGIN: "300px",
} as const;

export const BADGE_TONE = {
  neutral: "neutral",
  community: "community",
  stock: "stock",
  top: "top",
} as const;


/**
 * The homepage wall. Twelve matches the server's default, and the first four
 * load eagerly because they are the only ones above the fold on a phone —
 * lazy-loading the visible photographs delays the one thing the page is for.
 */
export const SHOWCASE = {
  LIMIT: 12,
  EAGER_COUNT: 4,
} as const;

/**
 * The food shown beside a sign-in form. Four fills the panel in a 2x2 without
 * any one photo being small enough to be unreadable as food.
 */
export const AUTH_PITCH = {
  COUNT: 4,
  /** Fetched, not shown: a refused photo is replaced rather than leaving a hole. */
  FETCH: 8,
} as const;

/**
 * Why someone flags a photo. Kept in step with the server's list — an unknown
 * reason is refused there.
 */
export const REPORT_REASONS = [
  { value: "wrong_dish", label: "That is not this dish" },
  { value: "not_this_restaurant", label: "Not from this restaurant" },
  { value: "offensive", label: "Offensive" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
] as const;

/**
 * The words the reporter picked, not the value stored beside them.
 *
 * The review queue printed `wrong_dish` — a column value, shown to the one
 * person who has to weigh it against somebody's photograph. An unrecognised
 * value is passed through rather than swallowed: a reason the server knows
 * and this list does not is worth seeing, even raw.
 */
export const reportReasonLabel = (value?: string | null): string =>
  REPORT_REASONS.find((reason) => reason.value === value)?.label ??
  value ??
  "";
