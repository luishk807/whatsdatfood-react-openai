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
 * Where a photo came from. Shown to the viewer, because a stock photo of the
 * dish and a photo of this restaurant's version answer different questions.
 */
export const IMAGE_SOURCE = {
  community: "community",
  stock: "stock",
} as const;

/**
 * Looking up a missing photo costs an image-search query plus an LLM call, so
 * it is driven by what the reader actually scrolls to and capped per page view.
 * A found photo is persisted by the backend, so each dish costs at most once.
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
