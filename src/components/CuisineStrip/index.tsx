import { type FC } from "react";
import { CUISINE_LABELS } from "@/customConstants/labels";
import { CuisineStripInterface } from "@/interfaces/generic";

/**
 * Generic food imagery on the front door.
 *
 * The homepage has a real problem this solves: dish photography is community
 * uploads only, so a deployment with no uploads yet shows a search box above
 * nothing at all. These say what the product is about without pretending to be
 * evidence about any particular kitchen.
 *
 * **Deliberately not interactive.** Searching a cuisine reaches the AI
 * generation path, which is the one place this product spends real money — a
 * grid of tiles on the front door where every tap opens the wallet is a bad
 * idea whatever the rate limit says. There is also no cuisine-browse route to
 * land on, and a tile that looks tappable and goes nowhere is worse than one
 * that never claimed to. The search box directly above is the action.
 *
 * The credit links are the exception, and they are interactive because
 * Unsplash's API terms require it. They are the only interactive thing in the
 * tile, so nothing is nested inside anything else.
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

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-1">
        {tiles.map((tile) => (
          <figure
            key={tile.category}
            className="m-0 flex w-40 shrink-0 snap-start flex-col gap-1 sm:w-48"
          >
            <div className="relative overflow-hidden rounded-card bg-surface-sunken">
              <img
                src={tile.thumb_url || tile.url}
                alt={tile.alt || ""}
                loading="lazy"
                decoding="async"
                className="h-28 w-full object-cover sm:h-32"
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-6">
                <figcaption className="text-sm font-semibold text-white">
                  {tile.label}
                </figcaption>
              </div>
            </div>

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
