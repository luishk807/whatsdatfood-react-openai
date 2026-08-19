import { type FC } from "react";
import { Link } from "react-router-dom";
import { AddAPhotoIcon, ChevronRightIcon } from "@/components/icons";
import { LOCATION_LABELS, TRENDING_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";
import { TrendingStripInterface } from "@/interfaces/location";
import { milesFrom } from "@/utils/distance";

/**
 * What people near you are actually eating — or, when nobody has yet, what
 * needs photographing.
 *
 * **Real photographs only.** Every tile here is a community upload. The strip
 * below this one is stock imagery and says so; if this one borrowed from it,
 * the distinction the whole product rests on would be gone from the front
 * door.
 *
 * **The server picks which of the two states this is** and says so in `mode`.
 * The threshold for "enough activity to call something trending" is a rule
 * about the data, and a copy of it here would be a second source of truth —
 * the same reason levels are derived on the server and never in the browser.
 *
 * **Nothing here is invented.** No placeholder popularity, no rounded-up
 * counts, no stock photo standing in for a dish nobody has photographed. The
 * empty state is a real dish at a real restaurant nearby with a button that
 * opens the camera.
 */
const TrendingStrip: FC<TrendingStripInterface> = ({
  discovery,
  loading,
  hasLocation,
  onChangeLocation,
}) => {
  // Nothing to say without a location, and asking for one is the job of the
  // control above rather than of a section that would be empty anyway.
  if (!hasLocation) {
    return null;
  }

  if (loading && !discovery) {
    return (
      <div className="h-44 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
    );
  }

  if (!discovery) {
    return null;
  }

  const place = discovery.area_label;
  const trending = discovery.mode === "trending";

  const heading = trending
    ? place
      ? TRENDING_LABELS.titleNear(place)
      : TRENDING_LABELS.title
    : place
      ? TRENDING_LABELS.contributeTitle(place)
      : TRENDING_LABELS.contributeTitleGeneric;

  const subtitle = trending
    ? place
      ? TRENDING_LABELS.subtitle(place)
      : TRENDING_LABELS.subtitleGeneric
    : TRENDING_LABELS.contributeBlurb;

  if (trending && !discovery.trending.length) {
    return null;
  }

  if (!trending && !discovery.needs_photos.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2" aria-labelledby="trending-strip">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2
            id="trending-strip"
            className="truncate text-base font-semibold text-ink"
          >
            {heading}
          </h2>
          <p className="truncate text-xs text-ink-muted">{subtitle}</p>
        </div>

        {/* The place name is the control. Somebody reading "near Flushing"
            while sitting in Brooklyn needs the fix to be where the wrong word
            is. */}
        <button
          type="button"
          onClick={onChangeLocation}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-ink underline underline-offset-2"
        >
          {LOCATION_LABELS.change}
          <ChevronRightIcon size={14} />
        </button>
      </div>

      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-1">
        {trending
          ? discovery.trending.map((dish) => (
              <li
                key={dish.dish_id}
                className="w-44 shrink-0 snap-start sm:w-52"
              >
                {/* The whole card, not the title. A 44px link inside a 180px
                    tile is a target somebody misses one-handed. */}
                <Link
                  to={
                    dish.restaurant_slug
                      ? buildMenuResultsPath(dish.restaurant_slug)
                      : "#"
                  }
                  className="flex h-full flex-col gap-1.5 rounded-card"
                >
                  <div className="overflow-hidden rounded-card bg-surface-sunken">
                    <img
                      src={dish.photo_thumb_url || dish.photo_url || ""}
                      alt={dish.dish_name}
                      loading="lazy"
                      decoding="async"
                      className="h-32 w-full object-cover sm:h-36"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="line-clamp-2 text-sm font-semibold text-ink">
                      {dish.dish_name}
                    </span>
                    <span className="truncate text-xs text-ink-muted">
                      {dish.restaurant_name}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {LOCATION_LABELS.miles(milesFrom(dish.distance_km))}
                      {TRENDING_LABELS.activity(
                        dish.photo_count,
                        dish.vote_count,
                      ) &&
                        ` · ${TRENDING_LABELS.activity(
                          dish.photo_count,
                          dish.vote_count,
                        )}`}
                    </span>
                    {dish.photographer && (
                      <span className="truncate text-[11px] text-ink-muted">
                        {TRENDING_LABELS.photoBy(dish.photographer)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))
          : discovery.needs_photos.map((dish) => (
              <li
                key={dish.dish_id}
                className="w-44 shrink-0 snap-start sm:w-52"
              >
                <Link
                  to={
                    dish.restaurant_slug
                      ? buildMenuResultsPath(dish.restaurant_slug)
                      : "#"
                  }
                  className="flex h-full flex-col gap-1.5 rounded-card border border-dashed border-line p-3"
                >
                  {/* A drawn plate, not a crossed-out camera: one reads as
                      waiting, the other as broken. */}
                  <span className="flex h-20 items-center justify-center rounded-card bg-surface-sunken text-ink-muted">
                    <AddAPhotoIcon size={22} />
                  </span>

                  <span className="line-clamp-2 text-sm font-semibold text-ink">
                    {dish.dish_name}
                  </span>
                  <span className="truncate text-xs text-ink-muted">
                    {dish.restaurant_name}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {LOCATION_LABELS.miles(milesFrom(dish.distance_km))} ·{" "}
                    {TRENDING_LABELS.noPhotos}
                  </span>
                  <span className="mt-auto pt-1 text-xs font-semibold text-ink underline underline-offset-2">
                    {TRENDING_LABELS.addFirst}
                  </span>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
};

export default TrendingStrip;
