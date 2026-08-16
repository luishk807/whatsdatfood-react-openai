/**
 * A dish is voted on with one tap. The values map onto the 1-5 rating scale the
 * backend already stores, so voting needs no schema change: an up vote is the
 * top of the scale, a down vote the bottom.
 */
export const VOTE = {
  up: 5,
  down: 1,
} as const;

/** Legacy star ratings above this read as an up vote. */
export const VOTE_MIDPOINT = (VOTE.up + VOTE.down) / 2;

export const RANKING = {
  /**
   * Shrinkage weight (m). A dish with few votes is pulled toward the
   * restaurant's own mean, so a single five-star vote cannot outrank a dish
   * with fifty good ones.
   */
  PRIOR_WEIGHT: 8,
  /** Below this, show the vote count instead of a rank. */
  MIN_VOTES_TO_RANK: 5,
  /** How many dishes the "most loved here" strip shows. */
  TOP_STRIP_SIZE: 5,
  /** Used as the prior when a restaurant has no votes at all yet. */
  FALLBACK_MEAN: 3,
} as const;

export const ORDERS = {
  /**
   * Below this many diners a percentage is noise dressed as a fact. Kept in
   * step with the server, which withholds the share for the same reason.
   */
  MIN_DINERS_FOR_SHARE: 5,
} as const;
