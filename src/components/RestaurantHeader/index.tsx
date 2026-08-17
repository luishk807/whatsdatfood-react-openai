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
      {/* Tight on purpose. Someone arrives here from a search, wanting the
          menu; the restaurant's identity has to be unambiguous and then get out
          of the way. The back arrow used to own a row to itself, which pushed
          the first dish most of a screen further down. */}
      <div className="mx-auto w-full max-w-5xl px-4 pb-3 pt-2">
        <div className="flex w-full items-start gap-1">
          <button
            type="button"
            onClick={goBack}
            aria-label={VENUE_LABELS.back}
            className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:text-ink"
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

            <p className="mt-0.5 text-sm text-ink-muted">
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

          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
};

export default RestaurantHeader;
