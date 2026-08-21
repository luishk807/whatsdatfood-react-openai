import { type FC, lazy, Suspense, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { CloseIcon, ListIcon, MapIcon } from "@/components/icons";
import LocationBadge from "@/components/LocationBadge";
import LocationSheet from "@/components/LocationSheet";
import NearbyList from "@/components/NearbyList";
import RestaurantPreview from "@/components/RestaurantPreview";
import useDiscoveryLocation from "@/customHooks/useDiscoveryLocation";
import useTasteCategories from "@/customHooks/useTasteCategories";
import {
  useNearbyRestaurants,
  useRestaurantsInArea,
} from "@/customHooks/useNearby";
import { LOCATION_SOURCE } from "@/customConstants/location";
import { mapConfigured } from "@/customConstants/map";
import { MAP_LABELS, NEARBY_LABELS } from "@/customConstants/labels";
import { NEARBY_PARAMS, buildNearbyPath } from "@/customConstants/routes";
import { categoryLabel } from "@/utils/categoryLabel";

/**
 * Nearby discovery: a list and a map of what is around you.
 *
 * **A cuisine tile lands here, on results.** It used to land on a page whose
 * entire content was a heading and two buttons, with the food a tap and a
 * navigation further on. Now the results render immediately for anybody we can
 * already place — a location chosen weeks ago, or a browser permission
 * standing from a previous visit — and only somebody we genuinely cannot place
 * is asked, in a sheet over this page rather than instead of it.
 *
 * **The map is loaded only when it is asked for**, and Mapbox is 1.78 MiB. The
 * list is the default view, it is the half that always works — no keyboard
 * reaches a pin and no screen reader reads a tile layer — and the map arrives
 * in its own chunk on the tap that shows it.
 *
 * **Switching to the map fetches nothing.** It is handed the restaurants the
 * list already has. Panning and zooming fetch nothing either; only "Search
 * this area" spends a query, and only ten rows of one. That is the whole cost
 * argument for this screen, and every part of it is a database read — no
 * Google, no geocoder, no model is reachable from here.
 *
 * **A cuisine is a filter on this page, not a page of its own.** "Chinese near
 * me" and "near me" differ by one query parameter and one heading; two routes
 * would be two copies of the same list, map, location control and empty state.
 */
const LazyMap = lazy(() => import("@/components/RestaurantMap"));

const NearbyPage: FC = () => {
  const [params, setParams] = useSearchParams();
  const cuisine = params.get(NEARBY_PARAMS.cuisine) || undefined;

  // In the URL so the choice survives a reload and a shared link opens on the
  // half the sender was looking at.
  const view = params.get(NEARBY_PARAMS.view) === "map" ? "map" : "list";

  const { location, source } = useDiscoveryLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);

  const { categories } = useTasteCategories();
  // What the server calls this category. Deriving it from the slug gave
  // "Dim_sum" in the heading and "Bbq" in the chip.
  const cuisineName = cuisine ? categoryLabel(cuisine, categories) : "";
  const nearby = useNearbyRestaurants(location, cuisine);
  const area = useRestaurantsInArea(cuisine);

  // The reader panned and asked; those results stand until they recentre.
  // Both lists are already filtered by the server, so nothing is thrown away
  // here after the fact — which is what used to turn "the ten nearest Italian
  // places" into "however many of ten happen to be Italian".
  const searchedArea = area.places !== null;
  const places = searchedArea ? area.places ?? [] : nearby.places;
  const hasMore = searchedArea ? area.hasMore : nearby.hasMore;
  const loadingMore = searchedArea ? area.loading : nearby.loadingMore;

  // Nothing at all until we can place somebody. The sheet over it is the ask,
  // and it opens itself exactly once — reopening it after a refusal is how a
  // page becomes impossible to read.
  const asked = !location && !nearby.loading;

  useEffect(() => {
    if (asked) {
      setChanging(true);
    }
  }, [asked]);

  const place = location?.label;
  const heading = cuisine
    ? place
      ? NEARBY_LABELS.cuisineNear(cuisineName, place)
      : NEARBY_LABELS.cuisineNearYou(cuisineName)
    : place
      ? NEARBY_LABELS.titleNear(place)
      : NEARBY_LABELS.title;

  const setView = (next: "list" | "map") => {
    const updated = new URLSearchParams(params);

    if (next === "map") {
      updated.set(NEARBY_PARAMS.view, next);
    } else {
      updated.delete(NEARBY_PARAMS.view);
    }

    // Replace rather than push: the back button belongs to the reader's
    // journey through the app, not to which half of one page they last read.
    setParams(updated, { replace: true });
  };

  const showMore = () => (searchedArea ? area.showMore() : nearby.showMore());

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 pb-16 pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-xl font-semibold tracking-tight text-ink">
            {heading}
          </h1>
          <p className="text-xs text-ink-muted">
            {searchedArea
              ? NEARBY_LABELS.inThisArea
              : NEARBY_LABELS.results(places.length)}
          </p>
        </div>

        {/* Two buttons rather than a segmented control with a moving thumb:
            the state has to be readable without relying on which half is
            tinted. */}
        <div
          role="group"
          aria-label={MAP_LABELS.list + " / " + MAP_LABELS.map}
          className="flex shrink-0 gap-1 rounded-pill border border-line p-1"
        >
          {(mapConfigured()
            ? (["list", "map"] as const)
            : (["list"] as const)
          ).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={clsx(
                "inline-flex min-h-9 items-center gap-1.5 rounded-pill px-3 text-sm",
                view === option
                  ? "bg-surface-sunken font-medium text-ink"
                  : "text-ink-muted",
              )}
            >
              {option === "list" ? (
                <ListIcon size={15} />
              ) : (
                <MapIcon size={15} />
              )}
              {option === "list" ? MAP_LABELS.list : MAP_LABELS.map}
            </button>
          ))}
        </div>
      </div>

      {/* One line, and a way to change it. Somebody who has told us where to
          look should not be asked again above the answer. */}
      <LocationBadge label={place} onChange={() => setChanging(true)} />

      {/* The active category, and the way out of it.
    
          A filter somebody cannot see is a filter they cannot undo, and this
          page is reached from a shortcut on the front door — so the reader
          arrives already filtered and has to be told. Clearing it drops the
          parameter and keeps the view, so clearing on the map leaves you on
          the map showing everything rather than back on a list. */}
      {cuisine && (
        <div className="flex justify-center">
          <Link
            to={buildNearbyPath({ view })}
            aria-label={NEARBY_LABELS.clearFilterLabel(cuisineName)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-pill border border-ink bg-surface-sunken px-3 text-sm text-ink"
          >
            {cuisineName}
            <CloseIcon size={14} className="text-ink-muted" />
          </Link>
        </div>
      )}

      {nearby.unavailable ? (
        <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-ink-muted">
          {NEARBY_LABELS.unavailable}
        </p>
      ) : view === "map" && location ? (
        <div className="flex flex-col gap-3">
          <div className="relative h-[55vh] overflow-hidden rounded-card border border-line">
            <Suspense
              fallback={
                <div className="h-full w-full animate-pulse bg-surface-sunken motion-reduce:animate-none" />
              }
            >
              {/* Handed the restaurants the list already has. Opening the map
                  costs a chunk download and not one query. */}
              <LazyMap
                places={places}
                centre={location}
                showMe={source === LOCATION_SOURCE.device}
                selectedId={selected}
                onSelect={setSelected}
                onSearchArea={area.search}
                onRecentre={area.clear}
              />
            </Suspense>

            {/* Over the map rather than beside it, and only for the pin that
                was actually tapped. Everything it shows arrived with the pin,
                so selecting one costs no request. */}
            <RestaurantPreview
              place={places.find((one) => one.id === selected) ?? null}
              onClose={() => setSelected(null)}
            />
          </div>

          {/* The list stays under the map rather than being replaced by it.
              A pin is not reachable with a keyboard, and the answer must not
              be. */}
          <NearbyList
            places={places}
            selectedId={selected}
            onSelect={setSelected}
            filterLabel={cuisine ? cuisineName : undefined}
            clearFilterHref={buildNearbyPath({ view })}
          />
        </div>
      ) : (
        <NearbyList
          places={places}
          loading={nearby.loading || area.loading}
          selectedId={selected}
          onSelect={setSelected}
          filterLabel={cuisine ? cuisineName : undefined}
          clearFilterHref={buildNearbyPath({ view })}
        />
      )}

      {/* Asked for, never automatic. An infinite scroll would spend a query
          every time a thumb drifted; this spends one when somebody has read
          what they were given and wants more. */}
      {hasMore && (
        <button
          type="button"
          onClick={showMore}
          disabled={loadingMore}
          className="mx-auto min-h-11 rounded-pill border border-line px-5 text-sm font-medium text-ink hover:bg-surface-sunken disabled:opacity-60"
        >
          {loadingMore
            ? NEARBY_LABELS.loadingMore
            : searchedArea
              ? NEARBY_LABELS.showMoreArea
              : NEARBY_LABELS.showMore}
        </button>
      )}

      <LocationSheet open={changing} onClose={() => setChanging(false)} />
    </div>
  );
};

export default NearbyPage;
