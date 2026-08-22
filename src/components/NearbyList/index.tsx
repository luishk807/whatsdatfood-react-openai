import { type FC, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import RestaurantCover from "@/components/RestaurantCover";
import { LOCATION_LABELS, NEARBY_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";
import { NearbyListInterface } from "@/interfaces/location";
import { milesFrom } from "@/utils/distance";

/**
 * Nearby restaurants as a list, which is the half that always works.
 *
 * The map beside it is the appealing half and the unusable one: no keyboard
 * reaches a pin and no screen reader reads a tile layer. This carries the same
 * places in the same order, so nothing is only available by pointing.
 *
 * **A restaurant with no photographs is listed, not hidden.** It is a real
 * place a short walk away, and the tile that says "no dish photos yet" is the
 * ask — hiding it would make the product look emptier than the neighbourhood
 * is, and remove the contribution the early stage depends on.
 */
const NearbyList: FC<NearbyListInterface> = ({
  places,
  loading,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  scrollToId,
  filterLabel,
  clearFilterHref,
}) => {
  // The row nodes, so a pin on the map can bring its own row into view.
  const rows = useRef<Map<string, HTMLLIElement>>(new Map());

  /**
   * Bring the row the map just selected into view.
   *
   * **Only ever from the map.** `scrollToId` is set by a pin being tapped and
   * by nothing the list itself did — scrolling on hover would move the list
   * out from under a pointer that is travelling down it, which is the list
   * fighting the person reading it.
   *
   * `block: "nearest"` is doing real work: a row already on screen is left
   * exactly where it is, so choosing pins for restaurants that are all
   * visible never moves the page at all. This is the same trap the category
   * bar hit — there, `scrollIntoView` scrolled the page as well as the chip
   * strip and cancelled the jump the reader had just asked for — and the
   * defence is the same: never scroll when nothing needs to move.
   */
  useEffect(() => {
    if (!scrollToId) {
      return;
    }

    rows.current.get(scrollToId)?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [scrollToId]);

  if (loading && !places.length) {
    return (
      <ul className="flex flex-col gap-2">
        {[0, 1, 2].map((row) => (
          <li
            key={row}
            className="h-24 animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none"
          />
        ))}
      </ul>
    );
  }

  // Nothing found, and *why* nothing was found is the whole message. With a
  // category filter on, the neighbourhood is usually not the problem: the
  // page said "No restaurants around here yet" for Coffee while five coffee
  // shops stood within four hundred metres of the reader. Blaming the area
  // sends somebody to widen a search that was never too narrow, so the
  // filtered version names the filter and offers the tap that drops it.
  if (!places.length) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-card border border-dashed border-line p-6 text-center">
        <p className="text-sm font-medium text-ink">
          {filterLabel ? NEARBY_LABELS.emptyFiltered(filterLabel) : NEARBY_LABELS.empty}
        </p>
        <p className="text-sm text-ink-muted">
          {filterLabel ? NEARBY_LABELS.emptyFilteredHelp : NEARBY_LABELS.emptyHelp}
        </p>

        {filterLabel && clearFilterHref && (
          <Link
            to={clearFilterHref}
            className="mt-2 inline-flex min-h-11 items-center rounded-pill border border-ink px-4 text-sm font-medium text-ink hover:bg-surface-sunken"
          >
            {NEARBY_LABELS.showEverything}
          </Link>
        )}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {places.map((place) => (
        <li
          key={place.id}
          ref={(node) => {
            if (node) {
              rows.current.set(place.id, node);
            } else {
              rows.current.delete(place.id);
            }
          }}
        >
          <Link
            to={place.slug ? buildMenuResultsPath(place.slug) : "#"}
            /* Focus does everything hover does. The map is the half no
               keyboard reaches, so if pointing were the only way to ask
               "where is this one", the answer would be unavailable to
               anybody using one. */
            onFocus={() => onHover?.(place.id)}
            onBlur={() => onHover?.(null)}
            onMouseEnter={() => onHover?.(place.id)}
            onMouseLeave={() => onHover?.(null)}
            onClick={() => onSelect?.(place.id)}
            aria-current={selectedId === place.id ? "true" : undefined}
            className={clsx(
              "flex gap-3 rounded-card border p-3",
              /* Chosen and still chosen after the pointer moved on, so it is
                 the stronger of the two marks. Being pointed at is a
                 preview and reads as one. */
              selectedId === place.id
                ? "border-ink bg-surface-sunken"
                : hoveredId === place.id
                  ? "border-line bg-surface-sunken"
                  : "border-line bg-surface-raised",
            )}
          >
            <RestaurantCover
              restaurant={place}
              ratio={undefined}
              className="h-20 w-20 shrink-0"
            />

            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold text-ink">
                {place.name}
              </span>

              <span className="truncate text-xs text-ink-muted">
                {LOCATION_LABELS.miles(milesFrom(place.distance_km))}
                {place.neighborhood ? ` · ${place.neighborhood}` : ""}
                {place.price_range ? ` · ${place.price_range}` : ""}
              </span>

              {place.top_dish_name ? (
                <span className="truncate text-xs text-ink">
                  {place.top_dish_name}
                </span>
              ) : (
                <span className="truncate text-xs text-ink-muted">
                  {NEARBY_LABELS.noPhotos}
                </span>
              )}

              <span className="pt-0.5 text-xs font-semibold text-ink underline underline-offset-2">
                {place.top_dish_photo_url
                  ? NEARBY_LABELS.seeDishes
                  : NEARBY_LABELS.addFirst}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NearbyList;
