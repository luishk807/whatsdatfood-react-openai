import { type FC, lazy, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { ListIcon, MapIcon } from "@/components/icons";
import LocationCue from "@/components/LocationCue";
import NearbyList from "@/components/NearbyList";
import RestaurantPreview from "@/components/RestaurantPreview";
import useDiscoveryLocation from "@/customHooks/useDiscoveryLocation";
import {
  useNearbyRestaurants,
  useRestaurantsInArea,
} from "@/customHooks/useNearby";
import { LOCATION_SOURCE, NEARBY } from "@/customConstants/location";
import { mapConfigured } from "@/customConstants/map";
import {
  LOCATION_LABELS,
  MAP_LABELS,
  NEARBY_LABELS,
} from "@/customConstants/labels";
import { NEARBY_PARAMS } from "@/customConstants/routes";
import { NearbyPlaceType } from "@/interfaces/location";

/**
 * Nearby discovery: a list and a map of what is around you.
 *
 * **The map is loaded only when it is asked for.** Leaflet plus its stylesheet
 * is a large thing to put in front of somebody who wanted a list of
 * restaurants, and on a phone the list is the better answer anyway — so the
 * list is the default view and the map arrives in its own chunk on the tap
 * that shows it.
 *
 * **A cuisine is a filter on this page, not a page of its own.** "Chinese near
 * me" and "near me" differ by one query parameter and one heading; two routes
 * would be two copies of the same list, map, location control and empty state.
 */
const LazyMap = lazy(() => import("@/components/RestaurantMap"));

const NearbyPage: FC = () => {
  const [params] = useSearchParams();
  const cuisine = params.get(NEARBY_PARAMS.cuisine) || undefined;

  const { location, source } = useDiscoveryLocation();
  const [view, setView] = useState<"list" | "map">("list");
  const [selected, setSelected] = useState<string | null>(null);
  const [areaResults, setAreaResults] = useState<NearbyPlaceType[] | null>(null);

  const { places, loading, unavailable } = useNearbyRestaurants(
    location,
    cuisine,
  );
  const { search } = useRestaurantsInArea();

  // The reader panned and asked; those results stand until they recentre.
  // "Search this area" does not take a cuisine, so the filter is reapplied
  // here rather than silently widening to everything.
  const shown = areaResults ?? places;

  const filtered = useMemo(
    () =>
      cuisine && areaResults
        ? areaResults.filter((place) => place.cuisine === cuisine)
        : shown,
    [areaResults, cuisine, shown],
  );

  const place = location?.label;
  const heading = cuisine
    ? place
      ? NEARBY_LABELS.cuisineNear(titleCase(cuisine), place)
      : NEARBY_LABELS.cuisineNearYou(titleCase(cuisine))
    : place
      ? NEARBY_LABELS.titleNear(place)
      : NEARBY_LABELS.title;

  if (!location) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10">
        <h1 className="text-center text-xl font-semibold text-ink">
          {cuisine
            ? NEARBY_LABELS.cuisineNearYou(titleCase(cuisine))
            : NEARBY_LABELS.needLocation}
        </h1>
        <LocationCue cuisine={cuisine} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 pb-16 pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-xl font-semibold tracking-tight text-ink">
            {heading}
          </h1>
          <p className="text-xs text-ink-muted">
            {NEARBY_LABELS.results(filtered.length)}
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
          {(mapConfigured() ? (["list", "map"] as const) : (["list"] as const)).map((option) => (
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
              {option === "list" ? <ListIcon size={15} /> : <MapIcon size={15} />}
              {option === "list" ? MAP_LABELS.list : MAP_LABELS.map}
            </button>
          ))}
        </div>
      </div>

      {unavailable ? (
        <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-ink-muted">
          {NEARBY_LABELS.unavailable}
        </p>
      ) : view === "map" ? (
        <div className="flex flex-col gap-3">
          <div className="relative h-[55vh] overflow-hidden rounded-card border border-line">
            <Suspense
              fallback={
                <div className="h-full w-full animate-pulse bg-surface-sunken motion-reduce:animate-none" />
              }
            >
              <LazyMap
                places={filtered}
                centre={location}
                showMe={source === LOCATION_SOURCE.device}
                selectedId={selected}
                onSelect={setSelected}
                onSearchArea={async (bounds) =>
                  setAreaResults(await search(bounds))
                }
                onRecentre={() => setAreaResults(null)}
              />
            </Suspense>

            {/* Over the map rather than beside it, and only for the pin that
                was actually tapped. Everything it shows arrived with the pin,
                so selecting one costs no request. */}
            <RestaurantPreview
              place={filtered.find((one) => one.id === selected) ?? null}
              onClose={() => setSelected(null)}
            />
          </div>

          {/* The list stays under the map rather than being replaced by it.
              A pin is not reachable with a keyboard, and the answer must not
              be. */}
          <NearbyList
            places={filtered}
            selectedId={selected}
            onSelect={setSelected}
          />
        </div>
      ) : (
        <NearbyList
          places={filtered}
          loading={loading}
          selectedId={selected}
          onSelect={setSelected}
        />
      )}

      <div className="pt-2">
        <p className="mb-1 text-xs text-ink-muted">
          {place ? LOCATION_LABELS.near(place) : LOCATION_LABELS.nearYou}
        </p>
        <LocationCue cuisine={cuisine} />
      </div>
    </div>
  );
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export default NearbyPage;
