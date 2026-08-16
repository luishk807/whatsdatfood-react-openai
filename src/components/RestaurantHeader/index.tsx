import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { RestaurantHeaderInterface } from "@/interfaces/venue";
import { VENUE_LABELS } from "@/customConstants/labels";
import { displayRating, hasDetails, priceRange } from "@/utils/venue";

/**
 * The restaurant, as the page's title.
 *
 * This screen used to open with fifteen blocks of metadata before the first
 * photograph, so the first pass squeezed all of it into one strip - and went
 * too far the other way: the restaurant name ended up a cramped flex child,
 * smaller than the dish names underneath it. The name is what tells you the
 * page is about the room you are sitting in, so it gets to be a heading.
 *
 * Everything else still lives behind Details. That part was right.
 */
const RestaurantHeader: FC<RestaurantHeaderInterface> = ({
  restaurant,
  action,
  onOpenDetails,
}) => {
  const navigate = useNavigate();
  const rating = displayRating(restaurant);
  const price = priceRange(restaurant);
  const area = restaurant?.city?.trim();
  const showDetails = hasDetails(restaurant);

  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-4 pt-3">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={VENUE_LABELS.back}
            className="-ml-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-muted hover:text-ink"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-ink sm:text-2xl">
              {restaurant?.name}
            </h1>

            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
              {rating && <span className="tabular-nums">★ {rating}</span>}
              {rating && (price || area) && <span aria-hidden="true">·</span>}
              {price && <span>{price}</span>}
              {price && area && <span aria-hidden="true">·</span>}
              {area && <span>{area}</span>}

              {showDetails && (
                <button
                  type="button"
                  onClick={onOpenDetails}
                  className="underline underline-offset-2 hover:text-ink"
                >
                  {VENUE_LABELS.details}
                </button>
              )}
            </p>
          </div>

          {action}
        </div>
      </div>
    </div>
  );
};

export default RestaurantHeader;
