import { COVER_SOURCE, CoverSource } from "@/customConstants/images";
import {
  RestaurantImagerySource,
  RestaurantCoverCandidate,
} from "@/interfaces/imagery";

/**
 * Which picture goes on a restaurant card, and the only place that decides.
 *
 * The homepage showed six identical grey rectangles with a camera in the
 * middle of each, which is what a product looks like before anybody has
 * contributed to it. The fix is not to lower the bar on what counts as a dish
 * photograph — that line is the product — but to accept that a *card* has more
 * places to look than a dish does.
 *
 * The order, and why it is that order:
 *
 *   1. a community photograph   somebody was at this table
 *   2. an owner's cover         the restaurant chose how it looks
 *   3. a Google Places photo    borrowed, credited, and temporary
 *   4. a logo                   a mark, not a photograph — a weak card
 *   5. our own cuisine artwork  honest about being a drawing
 *
 * **Community work outranks Google permanently, not by luck.** The first
 * upload at a restaurant replaces the borrowed photograph on every card
 * showing it, because this function is consulted at render and nothing is ever
 * written back over an image row. Google imagery cannot overwrite a
 * contribution because it is not stored beside one.
 *
 * **The whole ordered list is returned, not just the winner.** A URL that 403s
 * is the common case rather than an edge one — third-party hosts refuse
 * hotlinks constantly and Google photo resources expire — so the card walks to
 * the next candidate rather than rendering a broken image. `fallback` is
 * always last and always present, which is what guarantees a card can never be
 * empty.
 */
export const getRestaurantCoverCandidates = (
  restaurant: RestaurantImagerySource,
): RestaurantCoverCandidate[] => {
  const candidates: RestaurantCoverCandidate[] = [];

  const add = (
    url: string | null | undefined,
    source: CoverSource,
    attribution?: RestaurantCoverCandidate["attribution"],
  ) => {
    const trimmed = (url || "").trim();

    // A blank string is not a photograph. Rendering one produces the broken
    // image glyph, which is the single worst thing a card can show.
    if (trimmed) {
      candidates.push({ url: trimmed, source, attribution: attribution ?? null });
    }
  };

  add(restaurant.top_dish_photo_url, COVER_SOURCE.community);
  add(restaurant.owner_photo_url, COVER_SOURCE.owner);
  add(restaurant.google_photo_url, COVER_SOURCE.google, {
    // Google's terms require the attribution that came with the photo to be
    // shown wherever the photo is. It travels with the candidate rather than
    // being looked up beside it, so a card physically cannot render the
    // picture without having the credit in hand.
    text: restaurant.google_photo_attribution || "",
    url: restaurant.google_photo_attribution_url || null,
  });
  add(restaurant.logo_url, COVER_SOURCE.logo);

  return candidates;
};

/**
 * The single best picture, or null when there is none and the card should
 * draw its cuisine instead.
 *
 * A convenience over the list above for callers that cannot retry — a map
 * marker, an `og:image`. Anything rendering an `<img>` a reader will look at
 * should take the list and handle failure.
 */
export const getRestaurantCoverImage = (
  restaurant: RestaurantImagerySource,
): RestaurantCoverCandidate | null =>
  getRestaurantCoverCandidates(restaurant)[0] ?? null;

/**
 * Whether this card is showing somebody's own work.
 *
 * The reason the distinction is kept all the way to the element: a borrowed
 * photograph is a placeholder that the first contributor gets to replace, and
 * the card is allowed to say so.
 */
export const isCommunityCover = (
  candidate: RestaurantCoverCandidate | null,
): boolean => candidate?.source === COVER_SOURCE.community;

/**
 * Whether a candidate obliges us to print a credit beside it.
 *
 * Google's photos do. Attribution is not decoration and not optional, and
 * treating it as either is a compliance problem rather than a cosmetic one —
 * the same rule the Unsplash credit on the cuisine tiles already follows.
 */
export const needsAttribution = (
  candidate: RestaurantCoverCandidate | null,
): boolean =>
  candidate?.source === COVER_SOURCE.google && Boolean(candidate.attribution?.text);
