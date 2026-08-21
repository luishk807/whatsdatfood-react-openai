import { type FC, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { COVER_SOURCE } from "@/customConstants/images";
import { IMAGERY_LABELS } from "@/customConstants/labels";
import { restaurantCategoryIcon } from "@/customConstants/foodIcons";
import {
  getRestaurantCoverCandidates,
  needsAttribution,
} from "@/utils/restaurantImage";
import { RestaurantCoverInterface } from "@/interfaces/imagery";

/**
 * The picture on a restaurant card.
 *
 * **A card is never empty.** It walks the ordered candidates from
 * `getRestaurantCoverCandidates` and, when every one of them fails or there
 * were none to begin with, draws the restaurant's cuisine. That last state is
 * the common one on a cold catalogue and is designed as the main case rather
 * than as a failure — it is our own artwork on a tinted ground, and it should
 * read as a considered blank rather than as an image that did not load.
 *
 * **Failure walks forward rather than giving up.** Third-party hosts refuse
 * hotlinks routinely and a Google photo resource expires, so `onError` moves
 * to the next candidate and only the end of the list reaches the drawing. A
 * broken-image glyph is never rendered, because the `<img>` is unmounted the
 * moment it fails.
 *
 * **The box is reserved before anything loads.** The aspect ratio is on the
 * container, so a photograph arriving late cannot push the name and the
 * distance down the page — the layout shift that makes a list feel cheap.
 */
const RestaurantCover: FC<RestaurantCoverInterface> = ({
  restaurant,
  className,
  ratio = "4 / 3",
  eager = false,
  rounded = "rounded-card",
}) => {
  const candidates = useMemo(
    () => getRestaurantCoverCandidates(restaurant),
    [restaurant],
  );

  const [index, setIndex] = useState(0);

  // A different restaurant in the same slot starts again at the best
  // candidate. Without this a card that failed over to its cuisine drawing
  // stayed there when the list re-ordered underneath it.
  useEffect(() => {
    setIndex(0);
  }, [candidates]);

  const candidate = candidates[index] ?? null;
  // Not `restaurant.cuisine` directly: it is null on most of the catalogue,
  // which gave crossed cutlery to nearly every card. The resolver reads the
  // name when there is nothing better.
  const Glyph = restaurantCategoryIcon(restaurant);

  return (
    <div
      /* No width of its own, deliberately.
       *
       * This used to force `w-full`, and a caller asking for `w-20` lost:
       * Tailwind utilities of equal specificity are decided by their order in
       * the stylesheet, not by their order in the class attribute, so the
       * caller's width was silently ignored. On a phone that turned every row
       * of the nearby list into a full-width photograph with the restaurant's
       * name crushed into a column one word wide.
       *
       * The size belongs to whoever is placing the card. */
      className={clsx(
        "relative overflow-hidden bg-surface-sunken",
        rounded,
        className,
      )}
      /* A fixed height from `className` reserves the box just as well, so
         the ratio is skipped rather than fighting it. */
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {candidate ? (
        <img
          // Keyed by URL so React replaces the element rather than reusing
          // one that has already errored — a reused `<img>` does not always
          // re-fire `onError`, which stranded the card on a broken source.
          key={candidate.url}
          src={candidate.url}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setIndex((current) => current + 1)}
          className="h-full w-full object-cover"
        />
      ) : (
        /* Not a photograph, and it does not imitate one. Our own drawing of
           what this kitchen serves, sized to read at a glance on a phone. */
        <div
          className="flex h-full w-full items-center justify-center text-ink-muted/45"
          data-cover-source={COVER_SOURCE.fallback}
        >
          <Glyph size={40} />
        </div>
      )}

      {/* Google requires the credit that arrived with the photo to be shown
          wherever the photo is. It is small and it is not optional — the same
          rule the Unsplash credit on the cuisine tiles follows, and cutting it
          off is a compliance problem rather than a cosmetic one. */}
      {needsAttribution(candidate) && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-0.5 pt-4 text-[9px] leading-tight text-white/90">
          {IMAGERY_LABELS.viaGoogle(candidate!.attribution!.text)}
        </span>
      )}
    </div>
  );
};

export default RestaurantCover;
