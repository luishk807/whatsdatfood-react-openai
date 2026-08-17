import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { RestaurantHeaderInterface } from "@/interfaces/venue";
import { VENUE_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";
import { displayRating, hasDetails, priceRange } from "@/utils/venue";

/**
 * The restaurant, as the page's title.
 *
 * Plain block layout on purpose. An earlier version put the name in a
 * `flex-1` column inside MUI's Grid, which imposed its own width - the column
 * collapsed to about 150px and the restaurant name wrapped one word per line.
 * Nothing here depends on a flex child negotiating its own size.
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

  /**
   * Back, or home when there is no back.
   *
   * Most arrivals here are a shared link or a search result opened directly,
   * and history(-1) from those leaves the app entirely - the browser goes to
   * whatever was in the tab before, which is usually nothing.
   */
  const goBack = () => {
    const index = (window.history.state as { idx?: number } | null)?.idx ?? 0;

    if (index > 0) {
      navigate(-1);
      return;
    }

    navigate(ROUTES.home);
  };

  const meta = [rating && `★ ${rating}`, price, area].filter(Boolean);

  return (
    <div className="w-full border-b border-line bg-surface">
      <div className="mx-auto w-full max-w-5xl px-4 pb-4 pt-2">
        <button
          type="button"
          onClick={goBack}
          aria-label={VENUE_LABELS.back}
          className="-ml-2 mb-1 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:text-ink"
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

        <div className="flex w-full items-start justify-between gap-4">
          <h1 className="text-xl font-semibold leading-tight tracking-tight text-ink sm:text-2xl">
            {restaurant?.name}
          </h1>

          {action && <div className="shrink-0">{action}</div>}
        </div>

        <p className="mt-1 text-sm text-ink-muted">
          {meta.join(" · ")}
          {showDetails && (
            <>
              {meta.length > 0 && " · "}
              <button
                type="button"
                onClick={onOpenDetails}
                className="underline underline-offset-2 hover:text-ink"
              >
                {VENUE_LABELS.details}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default RestaurantHeader;
