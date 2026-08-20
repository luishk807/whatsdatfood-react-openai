import { type FC } from "react";
import { Link } from "react-router-dom";
import { AddAPhotoIcon, CloseIcon } from "@/components/icons";
import {
  LOCATION_LABELS,
  MAP_LABELS,
  NEARBY_LABELS,
} from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";
import { RestaurantPreviewInterface } from "@/interfaces/location";
import { milesFrom } from "@/utils/distance";

/**
 * The restaurant behind a pin, shown without leaving the map.
 *
 * **Everything here is already in hand.** The place came from the nearby
 * query that drew the pin, so selecting one costs nothing — no Google call, no
 * second round trip, nothing that could make panning around expensive. If a
 * field is not on the row it is not shown; there is no version of this that
 * goes and fetches more.
 *
 * **A card, not a modal.** It rises from the bottom edge on a phone and sits
 * in the lower-left corner from `sm` up, and in neither case does it take the
 * map away — the reader is mid-comparison, and a dialog that has to be
 * dismissed before the next pin can be tapped turns browsing into a sequence
 * of decisions. That is also why there is no backdrop and no scroll lock.
 *
 * The whole card is the link. A caption-sized target inside a card is what a
 * thumb misses, and the close button is the only other control precisely so
 * nothing is nested inside the link.
 */
const RestaurantPreview: FC<RestaurantPreviewInterface> = ({
  place,
  onClose,
}) => {
  if (!place) {
    return null;
  }

  const details = [
    place.cuisine ? titleCase(place.cuisine) : null,
    place.price_range,
    place.neighborhood,
  ].filter(Boolean);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-start p-3 sm:inset-auto sm:bottom-3 sm:left-3 sm:max-w-sm">
      <div className="pointer-events-auto relative w-full overflow-hidden rounded-card border border-line bg-surface-raised shadow-tile">
        <button
          type="button"
          onClick={onClose}
          aria-label={MAP_LABELS.closePreview}
          className="absolute right-1 top-1 z-10 flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken"
        >
          <CloseIcon size={18} />
        </button>

        <Link
          to={place.slug ? buildMenuResultsPath(place.slug) : "#"}
          className="flex gap-3 p-3"
        >
          {place.top_dish_photo_url ? (
            <img
              src={place.top_dish_photo_url}
              alt=""
              loading="lazy"
              className="h-20 w-20 shrink-0 rounded-tile object-cover"
            />
          ) : (
            /* The empty tile is the ask, here as everywhere else: most
               restaurants have no photograph yet and saying so is what gets
               the first one taken. */
            <span className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-tile bg-surface-sunken text-ink-muted">
              <AddAPhotoIcon size={20} />
              <span className="px-1 text-center text-[10px] leading-tight">
                {NEARBY_LABELS.noPhotos}
              </span>
            </span>
          )}

          <span className="flex min-w-0 flex-1 flex-col gap-0.5 pr-7">
            <span className="truncate text-sm font-semibold text-ink">
              {place.name}
            </span>

            {details.length > 0 && (
              <span className="truncate text-xs text-ink-muted">
                {details.join(" · ")}
              </span>
            )}

            {place.top_dish_name && (
              /* The dish, not a star rating. What somebody photographed here
                 is the thing this product knows and a review site does not. */
              <span className="truncate text-xs text-ink-muted">
                {MAP_LABELS.topDish(place.top_dish_name)}
              </span>
            )}

            <span className="mt-auto flex items-baseline gap-2 pt-1">
              <span className="text-xs font-medium text-brand">
                {NEARBY_LABELS.seeDishes}
              </span>
              <span className="text-xs text-ink-muted">
                {LOCATION_LABELS.miles(milesFrom(place.distance_km))}
              </span>
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export default RestaurantPreview;
