import { type FC } from "react";
import { Link } from "react-router-dom";
import HotPick from "@/components/HotPick";
import RestaurantCover from "@/components/RestaurantCover";
import { ChevronRightIcon } from "@/components/icons";
import { LOCATION_LABELS, DISCOVERY_LABELS } from "@/customConstants/labels";
import { ROUTES, buildMenuResultsPath } from "@/customConstants/routes";
import {
  TrendingCardInterface,
  TrendingRestaurantsInterface,
} from "@/interfaces/trending";
import { milesFrom } from "@/utils/distance";

/**
 * Places to go, on the front door.
 *
 * **The server names this section.** Whether six restaurants amount to a
 * trend is a rule about the data, and a copy of that rule here would be a
 * second source of truth — the one that goes stale. Below the threshold the
 * heading says "Popular near you", which is a claim we can actually support.
 *
 * **Nothing at all without a location, and nothing when the query fails.**
 * The search box above is what people came for; an apology under it helps
 * nobody.
 *
 * **A swipe on a phone, a grid from `sm` up.** Two and a half cards visible
 * at 390px, which is what says there is more to the right — the same shape
 * the cuisine strip uses, for the same reason.
 */
const TrendingCard: FC<TrendingCardInterface> = ({ restaurant }) => {
  const meta = [
    restaurant.cuisine && titleCase(restaurant.cuisine),
    restaurant.neighborhood,
  ].filter(Boolean);

  return (
    // The whole card is the link. A label-sized target inside a 160px card is
    // what a thumb misses.
    <Link
      to={restaurant.slug ? buildMenuResultsPath(restaurant.slug) : "#"}
      className="flex w-40 shrink-0 snap-start flex-col overflow-hidden rounded-card border border-line bg-surface-raised sm:w-auto"
    >
      {/* One rule decides what goes here — see `utils/restaurantImage`. Six
          identical grey rectangles with a camera in each is what this page
          used to be, and none of them was a photograph of anything. */}
      <RestaurantCover
        restaurant={restaurant}
        ratio={undefined}
        rounded="rounded-none"
        className="h-28 shrink-0"
      />

      <span className="flex flex-1 flex-col gap-0.5 p-2">
        <span className="truncate text-sm font-medium text-ink">
          {restaurant.name}
        </span>
        {meta.length > 0 && (
          <span className="truncate text-xs text-ink-muted">
            {meta.join(" · ")}
          </span>
        )}
        {restaurant.top_dish_name && (
          <span className="truncate text-xs text-ink-muted">
            {restaurant.top_dish_name}
          </span>
        )}
        <span className="mt-auto pt-1 text-xs text-ink-muted">
          {LOCATION_LABELS.miles(milesFrom(restaurant.distance_km))}
        </span>
      </span>
    </Link>
  );
};

const TrendingRestaurants: FC<TrendingRestaurantsInterface> = ({
  trending,
  loading,
  hasLocation,
  onChangeLocation,
}) => {
  if (!hasLocation) {
    return null;
  }

  if (loading && !trending) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {[0, 1, 2].map((one) => (
          <div
            key={one}
            className="h-44 w-40 shrink-0 animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  if (!trending?.restaurants?.length) {
    return null;
  }

  const isTrending = trending.mode === "trending";
  const area = trending.area_label;

  return (
    <section className="flex flex-col gap-4">
      <HotPick pick={trending.hot_pick} mode={trending.mode} />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">
            {isTrending
              ? area
                ? DISCOVERY_LABELS.trendingNear(area)
                : DISCOVERY_LABELS.trendingNearYou
              : area
                ? DISCOVERY_LABELS.popularNear(area)
                : DISCOVERY_LABELS.popularNearYou}
          </h2>

          {/* The place name is the control. Somebody reading "near Flushing"
              while sitting in Brooklyn needs the fix to be where the wrong
              word is. */}
          <button
            type="button"
            onClick={onChangeLocation}
            className="min-h-9 text-xs text-ink-muted underline underline-offset-2 hover:text-ink"
          >
            {LOCATION_LABELS.change}
          </button>
        </div>

        <p className="text-xs text-ink-muted">
          {isTrending ? DISCOVERY_LABELS.thisMonth : DISCOVERY_LABELS.discoverBlurb}
        </p>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {trending.restaurants.map((restaurant) => (
            <li key={restaurant.id} className="contents sm:block">
              <TrendingCard restaurant={restaurant} />
            </li>
          ))}
        </ul>

        <Link
          to={ROUTES.nearby}
          className="inline-flex min-h-9 items-center gap-1 self-start text-sm font-medium text-ink underline-offset-4 hover:underline"
        >
          {DISCOVERY_LABELS.seeAllNearby}
          <ChevronRightIcon size={15} />
        </Link>
      </div>
    </section>
  );
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export default TrendingRestaurants;
