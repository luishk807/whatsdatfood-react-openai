import { type FC } from "react";
import { Link } from "react-router-dom";
import { CUISINE_LABELS } from "@/customConstants/labels";
import { buildNearbyPath } from "@/customConstants/routes";
import { CuisineStripInterface } from "@/interfaces/generic";

/**
 * Generic food imagery on the front door.
 *
 * The homepage has a real problem this solves: dish photography is community
 * uploads only, so a deployment with no uploads yet shows a search box above
 * nothing at all. These say what the product is about without pretending to be
 * evidence about any particular kitchen.
 *
 * **The whole tile is now a link, and it was right that it was not before.**
 * The old reason was sound: a cuisine tile that ran a search reached the AI
 * generation path, which is the one place this product spends real money, and
 * there was no cuisine route to land on either. Both have changed. `/nearby`
 * answers "Chinese restaurants around here" out of the database — a bounding
 * box and a `cuisine` column, no model, no third party — so the tap is free
 * and it lands somewhere real.
 *
 * The credit sits *outside* the link rather than inside it. Unsplash's terms
 * require a working link to the photographer, and a link inside a link is
 * invalid markup that browsers resolve by dropping one of them — which would
 * be the one the terms require.
 */
const CuisineStrip: FC<CuisineStripInterface> = ({ tiles, loading }) => {
  // Nothing to show is a complete answer. The search box is what people came
  // for, and a row of grey rectangles under it is worse than clean space.
  if (loading || !tiles.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2" aria-labelledby="cuisine-strip">
      {/* Stacked on a phone. Side by side, the disclosure and the heading fill
          a 390px row edge to edge with no gap between them. */}
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h2 id="cuisine-strip" className="text-sm font-semibold text-ink">
          {CUISINE_LABELS.title}
        </h2>
        {/* The line that keeps this honest. Every other photograph in this
            product is evidence somebody was at a table; these are not, and a
            reader must never have to work that out for themselves. */}
        <p className="text-[11px] text-ink-muted">{CUISINE_LABELS.disclosure}</p>
      </div>

      {/* A swipe on a phone, a grid once there is width for one. Two and a
          half cards visible on a 390px screen, which is what says "there is
          more to the right" without anybody having to guess. */}
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {tiles.map((tile) => (
          <figure
            key={tile.category}
            className="m-0 flex w-40 shrink-0 snap-start flex-col gap-1 sm:w-auto sm:shrink"
          >
            {/* The whole tile, not the word. A label-sized target inside a
                160px card is the thing a thumb misses. */}
            <Link
              to={buildNearbyPath({ cuisine: tile.category })}
              aria-label={CUISINE_LABELS.findNearby(tile.label)}
              className="relative block overflow-hidden rounded-card bg-surface-sunken"
            >
              <img
                src={tile.thumb_url || tile.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-28 w-full object-cover sm:h-32"
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-6">
                <figcaption className="text-sm font-semibold text-white">
                  {tile.label}
                </figcaption>
              </div>
            </Link>

            {/* Under the photo rather than over it. Overlaid, the credit wrapped
                to two lines inside a 40px scrim and ran off the tile - and this
                is the one piece of text here that is not optional. */}
            {tile.photographer && (
              // Wraps rather than truncates. `truncate` clipped this to
              // "Photo by Orijit Chatterjee on Uns..." - and the Unsplash link
              // is required by the API terms, so cutting it off is a
              // compliance problem rather than a cosmetic one.
              <p className="px-0.5 text-[10px] leading-tight text-ink-muted">
                {CUISINE_LABELS.photoBy}{" "}
                <a
                  href={tile.photographer_url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  {tile.photographer}
                </a>{" "}
                {CUISINE_LABELS.on}{" "}
                <a
                  href={tile.provider_url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  Unsplash
                </a>
              </p>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
};

export default CuisineStrip;
