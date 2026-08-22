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
  /**
   * Two states, deliberately, because they answer different questions.
   *
   * `hovered` is "what am I pointing at" — a preview that lasts exactly as
   * long as the pointer or the focus does. `chosen` is "what did I pick",
   * and it has to survive the pointer moving on: tapping Busy Bee Cafe and
   * then reading down the list used to throw the choice away on the very
   * next row, because hover *was* selection.
   *
   * `fromMap` rides along because only the map may scroll the list. A row
   * that scrolls itself under a pointer travelling down it is a list
   * fighting its reader.
   */
  const [hovered, setHovered] = useState<string | null>(null);
  const [chosen, setChosen] = useState<{ id: string; fromMap: boolean } | null>(
    null,
  );
  const [changing, setChanging] = useState(false);

  const selectedId = chosen?.id ?? null;
  // The card answers the pointer first and the choice second — the reader has
  // picked one place and is now asking about another.
  const previewId = hovered ?? selectedId;

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

  // Both halves on screen at once, which is a `lg` decision and a map-view
  // one. Below that the map is a tab, because a phone has room for one of
  // these at a time and two cramped columns is neither.
  const workspace = view === "map" && Boolean(location) && !nearby.unavailable;

  /**
   * The results, identical in both views.
   *
   * Built once rather than written into each branch: on the split the list
   * and its "show more" are a column, and off it they are the page. Two
   * copies is how the button ends up under the map on one of them.
   */
  const results = (
    <div className="flex flex-col gap-3">
      <NearbyList
        places={places}
        loading={nearby.loading || area.loading}
        selectedId={selectedId}
        hoveredId={hovered}
        onSelect={(id) => setChosen({ id, fromMap: false })}
        onHover={setHovered}
        scrollToId={chosen?.fromMap ? chosen.id : null}
        filterLabel={cuisine ? cuisineName : undefined}
        clearFilterHref={buildNearbyPath({ view })}
      />

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
    </div>
  );

  return (
    <div
      className={clsx(
        "mx-auto flex w-full flex-col gap-3 px-4 pt-4",
        /* **The map view is a workspace, not a page with a map on it.**
           Every other screen in this product is a column of content and
           belongs at the shell's width. This one is a tool: the map is the
           larger half, the results scroll inside it, and constraining the
           pair to a reading measure wastes the width that makes a map worth
           looking at. Capped rather than edge-to-edge - a map three
           thousand pixels wide is not more useful, it is just further from
           the list. */
        workspace
          ? "max-w-[1800px] pb-4"
          : "max-w-5xl pb-16",
      )}
    >
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

      {/* Looking somewhere we have never looked. One quiet line, under the
          results that are already on screen - never a spinner in place of
          them, and never a word about how any of it works. */}
      {nearby.discovering && (
        <p
          role="status"
          className="flex items-center justify-center gap-2 text-sm text-ink-muted"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-muted motion-reduce:animate-none" />
          {NEARBY_LABELS.findingMore}
        </p>
      )}

      {nearby.unavailable ? (
        <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-ink-muted">
          {NEARBY_LABELS.unavailable}
        </p>
      ) : view === "map" && location ? (
        /* The split, and it is one interface rather than two sections.
    
           Stacked — map on top, results below — the relationship broke the
           moment the reader scrolled: the map went up past the top of the
           window and hovering a result became a change to something nobody
           could see. Side by side with the map pinned, reading down the list
           and watching the map answer is the whole interaction.
    
           Two columns from `lg` only. Below that the map is a tab, because a
           phone has room for one of these at a time and half a map beside
           half a list is neither. */
        /* **One workspace, two panes, one scrollbar that matters.**

           The whole page used to scroll, which meant reading past the sixth
           restaurant carried the map off the top of the window - and the map
           is the entire reason for this view. Here the workspace is the
           height of what is left below the controls, the results pane owns
           its own scroll, and the map never moves because nothing it sits in
           is moving.

           `min-h-0` on the grid and on the results pane is load-bearing: a
           grid item's default `min-height: auto` refuses to shrink below its
           content, so without it the pane grows to fit every restaurant and
           the page scrolls after all - the exact bug this replaces.

           The proportions shift with the room. 45/55 where a laptop has to
           keep the cards legible, 38/62 once there is width to spare, and a
           floor in pixels so the results never become a column of wrapped
           fragments - which is also the width the recognition marks
           (Michelin, Must Visit) will need when they arrive.

           **The height is the viewport under the header, and the offset is
           the header's own `h-14`** rather than a number measured off one
           screenshot. An earlier version subtracted a guess at everything
           above the workspace — title, location line, filter chip — which is
           a figure that changes the moment a filter is applied, and being
           wrong high pushes the bottom of the map below the fold and brings
           back the page scroll this exists to remove.

           Sticky, so the reader gets both: the title and filters scroll away
           like ordinary page content, then the workspace reaches the header
           and pins. Its parent is exactly this plus those controls, so the
           travel available to the sticky element is the height of the
           controls — it pins when they are gone and stays pinned.

           **The footer's height comes off the top of that**, and it has to.
           A workspace the full height of the window and a footer below it in
           the document cannot both be on screen: revealing the footer means
           the pinned workspace moving up, which clips the top of the map and
           takes the zoom controls with it. No amount of padding or sticky
           travel avoids that — the only fix is leaving room, so the bar, the
           workspace and the footer add up to one screen. `dvh` rather than
           `vh` because a phone's address bar makes the two differ by the
           height of a restaurant card. */
        // On a phone the map pins to the top of the viewport once it gets
        // there, and the results keep scrolling underneath it. Sticky rather
        // than fixed with a locked page: `position: sticky` needs no scroll
        // listener, no height arithmetic and no scroll locking, so Safari's
        // disappearing toolbar and Mapbox's own gesture handling both keep
        // working - and until the map reaches the top, the page scrolls
        // normally through the heading, the filters and the location.
        <div className="flex flex-col gap-3 lg:sticky lg:top-[var(--offset-header)] lg:grid lg:h-[calc(100dvh-var(--offset-header)-var(--height-footer))] lg:min-h-0 lg:grid-cols-[minmax(380px,45fr)_55fr] lg:gap-4 xl:grid-cols-[minmax(420px,38fr)_62fr]">
          {/* Second in the source order, first on the screen at `lg`: the
              list is the half that always works, so it is what a screen
              reader and a keyboard reach first. On a phone the map is on
              top, which is the view somebody asked for by tapping Map. */}
          <div className="sticky top-[var(--offset-header)] z-10 -mx-4 h-[var(--height-map-phone)] overflow-hidden border-y border-line bg-surface px-0 sm:mx-0 sm:rounded-card sm:border lg:static lg:z-auto lg:order-2 lg:h-full lg:border">
            <Suspense
              fallback={
                <div className="h-full w-full animate-pulse bg-surface-sunken motion-reduce:animate-none" />
              }
            >
              {/* Handed the restaurants the list already has. Opening the
                  map costs a chunk download and not one query, and
                  pointing at a row costs nothing at all. */}
              <LazyMap
                places={places}
                centre={location}
                showMe={source === LOCATION_SOURCE.device}
                selectedId={selectedId}
                hoveredId={hovered}
                onSelect={(id) => setChosen(id ? { id, fromMap: true } : null)}
                onHover={setHovered}
                onSearchArea={area.search}
                onRecentre={area.clear}
              />
            </Suspense>

            {/* The full card, for a restaurant somebody actually chose.
                Pointing at a row gets a name beside its pin instead — the
                card carries the dish line and the way into the menu, which
                is a lot of page to throw up on every row a pointer crosses.
                Everything it shows arrived with the pin, so it costs no
                request. */}
            <RestaurantPreview
              place={places.find((one) => one.id === selectedId) ?? null}
              onClose={() => setChosen(null)}
            />
          </div>

          {/* **The one scrollable area inside the workspace**, which is what
              lets the map stay still: a wheel over this pane moves the pane,
              because the browser scrolls the innermost scroller that can
              still move before it touches the document.

              **Scroll chaining is deliberately left on.** It was
              `overscroll-contain`, which is the opposite of what this needs:
              contain refuses to hand the scroll onward at all, so a reader
              who had run out of restaurants could not reach the footer
              without first moving the pointer off the list. Chaining *is*
              the handoff — the pane scrolls while it has room, and the page
              takes over at the top and bottom edges, in whichever direction
              the pane can no longer move.

              `lg:min-h-0` is load-bearing. A grid item defaults to
              `min-height: auto` and refuses to shrink below its content, so
              without it this pane grows to fit every restaurant, never
              overflows, never scrolls, and the document scrolls instead —
              carrying the map off the top of the window, which is the whole
              complaint.

              Below `lg` there is no inner scroller at all: the map is pinned
              above and the list is ordinary page content under it, which is
              the one-thumb version of the same idea. `env(safe-area-inset-
              bottom)` keeps the last card clear of the iPhone home indicator
              and of Safari's toolbar when it slides back in. */}
          <div className="results-scroll min-w-0 pb-[env(safe-area-inset-bottom)] lg:order-1 lg:min-h-0 lg:overflow-y-auto lg:pb-4 lg:pr-1">
            {results}
          </div>
        </div>
      ) : (
        results
      )}

      <LocationSheet open={changing} onClose={() => setChanging(false)} />
    </div>
  );
};

export default NearbyPage;
