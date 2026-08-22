/**
 * Finding food near you.
 *
 * The product's question is "what should I order here", and until now a reader
 * had to already know where "here" was and type its name.
 */

export const GEOLOCATION_STATUS = {
  idle: "idle",
  prompting: "prompting",
  granted: "granted",
  denied: "denied",
  unavailable: "unavailable",
  timedOut: "timedOut",
} as const;

export type GeolocationStatus =
  (typeof GEOLOCATION_STATUS)[keyof typeof GEOLOCATION_STATUS];

export const GEOLOCATION = {
  /**
   * Long enough for a cold GPS fix indoors, short enough that a reader is not
   * left watching a spinner wondering whether they missed a permission dialog.
   */
  TIMEOUT_MS: 10_000,
  /** A fix from the last five minutes is the same restaurant. */
  MAX_AGE_MS: 5 * 60 * 1000,
} as const;

/** Where a location came from. Shown, because "near you" and "near Flushing"
 * are different claims and the reader should know which they are reading. */
export const LOCATION_SOURCE = {
  device: "device",
  chosen: "chosen",
} as const;

export type LocationSource =
  (typeof LOCATION_SOURCE)[keyof typeof LOCATION_SOURCE];

/**
 * The chosen location survives a reload, so somebody who picked "Flushing"
 * once is not asked again on every visit.
 *
 * Only a typed choice is stored. A device fix is never persisted: it is the
 * most sensitive thing this app ever touches, it goes stale, and re-asking the
 * browser costs one tap.
 */
export const LOCATION_STORAGE_KEY = "wdf.location";

export const NEARBY = {
  /**
   * How many results a section must keep after cross-section deduplication
   * for the deduplication to be worth applying at all.
   *
   * Below this, filtering is abandoned and the section shows what it had. A
   * row stripped to two weak results is worse than one repeating a restaurant
   * from the section above: the reader loses a real recommendation to gain a
   * tidiness they never asked for.
   */
  MIN_AFTER_DEDUPE: 3,
  /**
   * How often to ask whether we have finished looking at somewhere new.
   *
   * Only ever polled while a look is actually running, which is once per
   * unfamiliar area and never again. Three seconds is slow enough to be
   * invisible on a bill and fast enough that results appear while somebody is
   * still reading the first screen of them.
   */
  COVERAGE_POLL_MS: 3000,
  /** Matches `NEARBY_RADIUS_KM_DEFAULT` on the server, which is what decides. */
  DEFAULT_RADIUS_KM: 5,
  /** The strip on the front door. A screenful, not a catalogue. */
  TRENDING_LIMIT: 10,
  /** Six restaurants: two rows of three on a desktop, a swipe on a phone. */
  TRENDING_RESTAURANTS: 6,
  /**
   * One batch of results, and what "Show more" adds.
   *
   * Ten is a screenful on a phone and it is also the cost ceiling: somebody
   * who opens a cuisine tile and decides in twenty seconds has cost one query
   * over ten rows. Everything past the first batch is asked for by a tap,
   * never fetched because a page opened. Matches `NEARBY_PAGE_SIZE` on the
   * server, which is what actually decides.
   */
  PAGE_SIZE: 10,
  /**
   * The ceiling on pins the map will hold at once.
   *
   * Reached by paging now rather than in one request, and the reason it can
   * be reached at all is that the markers cluster — forty individual pins on
   * a zoomed-out map is the smear that `utils/cluster.ts` exists to prevent.
   */
  MAP_LIMIT: 40,
  // There is deliberately no fallback centre. A map opened on a guessed
  // location shows real restaurants at real distances from somewhere the
  // reader is not, and "0.3 mi" from the wrong point is worse than an empty
  // page asking where to look. With no location the page asks; it does not
  // pick one.
  DEFAULT_ZOOM: 14,
} as const;

/**
 * Kilometres are what the server returns; miles are what a reader in New York
 * expects. Converted for display only — never stored, never sent back.
 */
export const KM_PER_MILE = 1.609344;
