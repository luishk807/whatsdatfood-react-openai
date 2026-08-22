import { type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { RecentreIcon } from "@/components/icons";
import {
  MAP_MARKER,
  MAP_MOVEMENT,
  MAP_REVEAL,
  MAP_STYLE,
  MAP_VIEW,
  MAPBOX_TOKEN,
} from "@/customConstants/map";
import { MAP_LABELS } from "@/customConstants/labels";
import { THEME } from "@/customConstants/theme";
import useTheme from "@/customHooks/useTheme";
import { NearbyPlaceType, RestaurantMapInterface } from "@/interfaces/location";
import {
  clusterPlaces,
  findCluster,
  insideView,
  placeInClusters,
  zoomIntoCluster,
} from "@/utils/cluster";
import { restaurantCategoryIcon } from "@/customConstants/foodIcons";
import {
  HOVER_POPUP_CLASS,
  createCluster,
  createMarker,
  createReveal,
  hoverLabel,
  markerFace,
  paintLabel,
  paintMarker,
} from "./markers";

/**
 * The map half of nearby discovery.
 *
 * **It draws our data and never fetches any.** Every pin came out of our own
 * PostgreSQL rows; panning, zooming and "search this area" all resolve against
 * the same bounds query the list uses. Mapbox is asked for tiles and nothing
 * else, and neither Google nor OpenAI is reachable from this screen —
 * identifying a restaurant we do not already hold is the search bar's job, on
 * a different page. A metered map that only renders is billed per load; a
 * metered map wired to a moving viewport is billed per drag.
 *
 * **The instance is created once, behind a ref.** Rebuilding it on render
 * loses the reader's pan and zoom, which is the whole interaction. Markers are
 * the only thing rebuilt, and even they are repainted rather than replaced
 * when the selection changes.
 *
 * **This is not the only way to read the results.** The list beside it carries
 * the same places in the same order — no keyboard reaches a pin and no screen
 * reader reads a tile layer, so the map is the appealing half and the list is
 * the load-bearing one.
 */
/** One taxonomy for every pin, revealed or not. */
const renderGlyph = (place: NearbyPlaceType) => {
  const Glyph = restaurantCategoryIcon(place);

  return <Glyph size={MAP_MARKER.GLYPH_SIZE} />;
};

const RestaurantMap: FC<RestaurantMapInterface> = ({
  places,
  centre,
  showMe,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onSearchArea,
  onRecentre,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const me = useRef<mapboxgl.Marker | null>(null);
  // The extra pin drawn for a place its cluster is currently hiding. One at
  // a time, and never one of the markers above — it is a temporary answer to
  // "which of these seven", not a member of the drawn set.
  const reveal = useRef<mapboxgl.Marker | null>(null);
  // The name beside the pin somebody is pointing at. One at a time, always —
  // reading down a list must not leave a trail of labels behind.
  const label = useRef<mapboxgl.Popup | null>(null);
  // Where the view sat when its contents were last fetched. "Moved enough" is
  // measured against this rather than against the previous frame, so a slow
  // drift across a city still adds up to having moved.
  const anchor = useRef<{ lng: number; lat: number; zoom: number } | null>(
    null,
  );
  const [moved, setMoved] = useState(false);
  // The grouping depends on how far in the reader is, so the zoom has to be
  // state rather than something read off the instance. Rounded, so a pinch
  // does not rebuild every marker on every animation frame.
  const [zoom, setZoom] = useState<number>(MAP_VIEW.DEFAULT_ZOOM);
  // The slots a category glyph is rendered into, collected as the markers
  // are built. Portals rather than a second React root per pin: they mount
  // and unmount with this component and cost nothing extra.
  const [faces, setFaces] = useState<
    { id: string; node: HTMLElement; place: NearbyPlaceType }[]
  >([]);
  // The glyph slot inside the revealed pin, kept apart from the list above
  // because that one is rebuilt whenever the grouping changes and this one
  // comes and goes with the pointer.
  const [revealFace, setRevealFace] = useState<{
    id: string;
    node: HTMLElement;
    place: NearbyPlaceType;
  } | null>(null);

  // Read inside a listener that is created once, so it goes through a ref.
  // Re-subscribing whenever the selection changed would drop the very click
  // that changed it.
  const select = useRef(onSelect);
  select.current = onSelect;
  const hover = useRef(onHover);
  hover.current = onHover;

  const { resolved } = useTheme();
  const style = resolved === THEME.dark ? MAP_STYLE.dark : MAP_STYLE.light;

  const farEnough = useCallback((instance: mapboxgl.Map): boolean => {
    const from = anchor.current;

    if (!from) {
      return true;
    }

    if (Math.abs(instance.getZoom() - from.zoom) >= MAP_MOVEMENT.ZOOM_DELTA) {
      return true;
    }

    // Measured against the span currently on screen, so the same gesture
    // means the same thing at every zoom level.
    const bounds = instance.getBounds();

    if (!bounds) {
      return false;
    }

    const now = instance.getCenter();
    const width = Math.abs(bounds.getEast() - bounds.getWest());
    const height = Math.abs(bounds.getNorth() - bounds.getSouth());

    return (
      Math.abs(now.lng - from.lng) > width * MAP_MOVEMENT.PAN_FRACTION ||
      Math.abs(now.lat - from.lat) > height * MAP_MOVEMENT.PAN_FRACTION
    );
  }, []);

  const anchorHere = (instance: mapboxgl.Map) => {
    const at = instance.getCenter();
    anchor.current = { lng: at.lng, lat: at.lat, zoom: instance.getZoom() };
  };

  useEffect(() => {
    if (!container.current || map.current) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const instance = new mapboxgl.Map({
      container: container.current,
      style,
      center: [centre.longitude, centre.latitude],
      zoom: MAP_VIEW.DEFAULT_ZOOM,
      maxZoom: MAP_VIEW.MAX_ZOOM,
      // One finger scrolls the page, two fingers move the map. The map sits
      // inside a page that scrolls, and without this a thumb landing on it
      // captures the drag and the page appears to have frozen.
      cooperativeGestures: true,
    });

    instance.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    anchorHere(instance);

    instance.on("moveend", (event) => {
      // Tracked for every move including our own, because the pins have to
      // regroup after a camera move just as much as after a drag.
      setZoom(Math.round(instance.getZoom() * 2) / 2);

      // `originalEvent` is present only when a person did it. Without the
      // check, our own `easeTo` — recentring, or zooming into a cluster —
      // would offer "search this area" for a move the reader never made.
      if (!event.originalEvent) {
        return;
      }

      setMoved(farEnough(instance));
    });

    // Tapping the map away from any pin puts it down. The marker handlers
    // stop their own clicks from reaching here, so choosing one pin straight
    // after another never clears in the same tick it selects.
    instance.on("click", () => {
      select.current?.(null);
      hover.current?.(null);
    });

    map.current = instance;

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current.clear();
      reveal.current?.remove();
      reveal.current = null;
      label.current?.remove();
      label.current = null;
      me.current?.remove();
      me.current = null;
      instance.remove();
      map.current = null;
    };
    // Once. A moving `centre` pans the existing map and the theme swaps the
    // style on it; neither may build a second one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    map.current?.setStyle(style);
  }, [style]);

  /**
   * Tell the map when its container changes size.
   *
   * Mapbox reads the container once and then sizes its canvas to what it
   * measured. Nothing about a CSS breakpoint, a pane becoming viewport-tall,
   * or a devtools panel opening reaches it — the canvas keeps the old
   * dimensions and the map renders into part of its box with dead space
   * around it. A window resize happens to fire its own listener; going from
   * the stacked layout to the split one does not.
   *
   * `resize()` on the instance that already exists, deliberately: it keeps
   * the centre, the zoom, every marker, the clusters and whatever the reader
   * had selected. Rebuilding the map to fit a new box would throw all of
   * that away, and it is the one thing that must never happen while somebody
   * is scrolling.
   */
  useEffect(() => {
    const instance = map.current;
    const node = container.current;

    if (!instance || !node || typeof ResizeObserver === "undefined") {
      return;
    }

    // **Only when the box actually changed size.** A ResizeObserver fires for
    // sub-pixel churn too, and a WebGL canvas resized mid-scroll is a visible
    // blink rather than a no-op. `svh` stops the phone map's height moving at
    // all, which is the real fix; this is the guard for everything else that
    // can nudge a box by a fraction - a scrollbar appearing beside the
    // results, a zoom level, a rotation.
    let width = node.clientWidth;
    let height = node.clientHeight;

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;

      if (!box) {
        return;
      }

      // Whole pixels: the canvas is sized in them, so a change smaller than
      // one cannot alter what is drawn.
      const nextWidth = Math.round(box.width);
      const nextHeight = Math.round(box.height);

      if (nextWidth === width && nextHeight === height) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      instance.resize();
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // Recentre when the reader picks a different place, without disturbing the
  // zoom they chose.
  useEffect(() => {
    const instance = map.current;

    if (!instance) {
      return;
    }

    instance.easeTo({
      center: [centre.longitude, centre.latitude],
      zoom: instance.getZoom(),
    });
    anchorHere(instance);
    setMoved(false);
  }, [centre.latitude, centre.longitude]);

  // Where the reader is, drawn unlike a restaurant because it is not one.
  // Absent when the location was typed: "Flushing" is an area, and a dot in
  // the middle of it would claim a precision nobody gave us.
  useEffect(() => {
    const instance = map.current;

    if (!instance) {
      return;
    }

    me.current?.remove();
    me.current = null;

    if (!showMe) {
      return;
    }

    const dot = document.createElement("div");
    dot.setAttribute("aria-hidden", "true");
    dot.style.width = "14px";
    dot.style.height = "14px";
    dot.style.borderRadius = "9999px";
    dot.style.background = "var(--color-brand)";
    dot.style.border = "3px solid var(--color-surface-raised)";
    dot.style.boxShadow = "0 0 0 1px var(--color-line)";

    me.current = new mapboxgl.Marker({ element: dot })
      .setLngLat([centre.longitude, centre.latitude])
      .addTo(instance);
  }, [showMe, centre.latitude, centre.longitude]);

  /**
   * The pins, grouped for the zoom they are about to be drawn at.
   *
   * Forty individual markers on a city-wide view is an unreadable smear, and
   * paging means there can now be forty. `utils/cluster.ts` does the
   * arithmetic; this component only draws the answer.
   */
  const clusters = useMemo(
    () => clusterPlaces(places, zoom),
    [places, zoom],
  );

  useEffect(() => {
    const instance = map.current;

    if (!instance) {
      return;
    }

    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();

    const slots: { id: string; node: HTMLElement; place: NearbyPlaceType }[] = [];

    clusters.forEach((cluster) => {
      const point: [number, number] = [cluster.longitude, cluster.latitude];

      if (cluster.places.length > 1) {
        const element = createCluster(cluster, () => {
          // A camera move over places already in hand. No query, nothing
          // billed — the same promise tapping a single pin makes.
          instance.easeTo({ center: point, zoom: zoomIntoCluster(zoom) });
        });

        markers.current.set(
          cluster.id,
          new mapboxgl.Marker({ element }).setLngLat(point).addTo(instance),
        );

        return;
      }

      const place = cluster.places[0];
      const element = createMarker(place, { selected: place.id === selectedId });

      element.addEventListener("click", (event) => {
        // Otherwise the map also sees a click on the canvas and clears the
        // selection in the same tick it was made.
        event.stopPropagation();
        select.current?.(place.id);
      });

      // The other direction of the same relationship: pointing at a pin
      // lights up its row in the list, exactly as pointing at a row lights
      // up its pin. Reported upward rather than painted here, so one piece
      // of state drives both halves and they cannot disagree.
      element.addEventListener("mouseenter", () => hover.current?.(place.id));
      element.addEventListener("mouseleave", () => hover.current?.(null));

      markers.current.set(
        place.id,
        new mapboxgl.Marker({ element }).setLngLat(point).addTo(instance),
      );

      const face = markerFace(element);

      if (face) {
        slots.push({ id: place.id, node: face, place });
      }
    });

    // One state write per rebuild, not one per pin. It does not re-run this
    // effect: `clusters` and `zoom` are unchanged by it.
    setFaces(slots);
    // `selectedId` is applied by the effect below. Rebuilding every marker
    // when it changes would destroy the one being tapped.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusters, zoom]);

  useEffect(() => {
    clusters.forEach((cluster) => {
      if (cluster.places.length > 1) {
        return;
      }

      const place = cluster.places[0];
      const element = markers.current.get(place.id)?.getElement();

      if (element) {
        paintMarker(element, place, {
          selected: place.id === selectedId,
          hovered: place.id === hoveredId,
        });
      }
    });
  }, [selectedId, hoveredId, clusters]);

  /**
   * The restaurant the map is currently answering about.
   *
   * Hover wins over selection while it lasts, because it is the more recent
   * question — the reader has chosen one place and is now asking about
   * another. When the pointer leaves, the answer falls back to what they
   * chose rather than to nothing.
   */
  const activeId = hoveredId ?? selectedId ?? null;

  /**
   * The extra pin for a place its own cluster is hiding.
   *
   * Only when the group has more than one member: a cluster of one *is* the
   * restaurant's marker, and it has already been emphasised in place, so a
   * second pin on top of it would be the same dot drawn twice.
   */
  useEffect(() => {
    const instance = map.current;

    if (!instance) {
      return;
    }

    reveal.current?.remove();
    reveal.current = null;
    setRevealFace(null);

    const cluster = findCluster(clusters, activeId);
    const place = placeInClusters(clusters, activeId);

    if (
      !cluster ||
      !place ||
      cluster.places.length < 2 ||
      place.latitude == null ||
      place.longitude == null
    ) {
      return;
    }

    const element = createReveal(place);

    element.addEventListener("click", (event) => {
      event.stopPropagation();
      select.current?.(place.id);
    });
    // Moving onto the revealed pin itself must not read as leaving the
    // restaurant — without this the pin removes itself the moment it is
    // pointed at, which looks like a flicker and is impossible to click.
    element.addEventListener("mouseenter", () => hover.current?.(place.id));

    reveal.current = new mapboxgl.Marker({ element })
      .setLngLat([place.longitude, place.latitude])
      .addTo(instance);

    const face = markerFace(element);

    if (face) {
      setRevealFace({ id: `reveal:${place.id}`, node: face, place });
    }
  }, [activeId, clusters]);

  /**
   * Move the camera only when the answer is off screen.
   *
   * A map that re-centres on every row the pointer crosses is unusable: the
   * frame the reader was comparing places in keeps sliding out from under
   * them. So a place already comfortably in view is emphasised where it
   * stands and nothing moves at all — which is the common case, since the
   * list and the map are showing the same ten results.
   *
   * When it does move it is a short pan at the **same zoom**. Changing the
   * zoom would rewrite the view the reader chose, and this fires from a
   * mouse crossing a list.
   *
   * `easeTo` carries no `originalEvent`, so none of this offers "Search this
   * area" — a fresh query must stay something the reader asked for, and a
   * hover is not an ask.
   */
  useEffect(() => {
    const instance = map.current;
    const place = placeInClusters(clusters, activeId);

    if (!instance || !place) {
      return;
    }

    const bounds = instance.getBounds();

    if (!bounds) {
      return;
    }

    const view = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };

    if (insideView(view, place)) {
      return;
    }

    instance.easeTo({
      center: [place.longitude as number, place.latitude as number],
      zoom: instance.getZoom(),
      duration: MAP_REVEAL.PAN_MS,
    });
  }, [activeId, clusters]);

  /**
   * The restaurant's name, beside its own pin.
   *
   * **Mapbox positions this, not us.** It was a `position: absolute` span
   * inside the marker element, and it rendered visibly to one side: that
   * element belongs to the library, it is transformed on every frame, and it
   * carries `line-height: 0` and touch padding of its own — so a label
   * measured against it is measured against a moving target. A `Popup` is
   * given a coordinate and works out where that is on screen through every
   * transform the map has. Container size, zoom, pixel ratio and a sticky
   * pane are all its arithmetic, and none of them are ours to re-derive.
   *
   * **No anchor is passed on purpose.** Given none, Mapbox chooses from the
   * space left in the container and flips near an edge — the label opens left
   * of a pin against the right edge, below one against the top. Passing a
   * fixed anchor is what makes a label clip at the boundary.
   *
   * **Hover only, and never for the restaurant whose card is already open.**
   * Pointing asks "which one is this" and a name answers it; the card with
   * the dish line and the way into the menu belongs to a choice somebody
   * made. Drawing both for one restaurant is two labels saying one thing.
   */
  useEffect(() => {
    const instance = map.current;

    if (!instance) {
      return;
    }

    label.current?.remove();
    label.current = null;

    if (!hoveredId || hoveredId === selectedId) {
      return;
    }

    const place = placeInClusters(clusters, hoveredId);

    if (!place || place.latitude == null || place.longitude == null) {
      return;
    }

    label.current = new mapboxgl.Popup({
      className: HOVER_POPUP_CLASS,
      closeButton: false,
      // It belongs to the pointer, not to a dismissal: it goes when the
      // pointer goes.
      closeOnClick: false,
      // Moving the keyboard's focus to a label that appeared under a mouse
      // would take it away from the list the reader is travelling down.
      focusAfterOpen: false,
      offset: MAP_REVEAL.LABEL_OFFSET_PX,
      maxWidth: "none",
    })
      // The restaurant's own coordinates. A place inside a cluster is labelled
      // where it actually is, never at the group's centre — the centre is an
      // average that may sit on none of its members, and a name floating there
      // says the restaurant is somewhere it is not.
      .setLngLat([place.longitude, place.latitude])
      .setDOMContent(hoverLabel(place))
      .addTo(instance);

    // After `addTo`, because the shell Mapbox paints white does not exist
    // until then.
    const shell = label.current.getElement?.();

    if (shell) {
      paintLabel(shell);
    }
  }, [hoveredId, selectedId, clusters]);

  const searchHere = () => {
    const instance = map.current;
    const bounds = instance?.getBounds();

    if (!instance || !bounds) {
      return;
    }

    anchorHere(instance);
    setMoved(false);
    onSearchArea?.({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
  };

  return (
    <div className="relative h-full w-full">
      <div
        ref={container}
        role="application"
        aria-label={MAP_LABELS.label}
        className="h-full w-full"
      />

      {/* A category glyph in each individual pin, so a zoomed-in map says what
          its places are rather than showing a field of identical white dots.
          Clusters are untouched — a number is what "several restaurants"
          means, and a cuisine icon would claim they were all one kind.

          Rendered through a portal into a node the marker already reserved,
          which is what keeps the taste picker, the homepage tiles, the nearby
          list and the map on one icon taxonomy. */}
      {faces.map(({ id, node, place }) =>
        createPortal(renderGlyph(place), node, id),
      )}

      {/* The revealed pin gets the same treatment: it is drawn to say *which*
          restaurant, so it has to carry the same category glyph as the pin it
          is standing in for. */}
      {revealFace &&
        createPortal(
          renderGlyph(revealFace.place),
          revealFace.node,
          revealFace.id,
        )}

      {/* Only once the reader has moved it, and moved it far enough to be
          looking somewhere else. Offered sooner, it invites a tap that
          re-runs the search they are still reading. */}
      {moved && onSearchArea && (
        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-4">
          <button
            type="button"
            onClick={searchHere}
            className="pointer-events-auto inline-flex min-h-11 items-center rounded-pill border border-line bg-surface-raised px-4 text-sm font-medium text-ink shadow-tile"
          >
            {MAP_LABELS.searchThisArea}
          </button>
        </div>
      )}

      {onRecentre && (
        <button
          type="button"
          onClick={() => {
            onRecentre();

            const instance = map.current;

            if (instance) {
              instance.easeTo({
                center: [centre.longitude, centre.latitude],
                zoom: MAP_VIEW.DEFAULT_ZOOM,
              });
              anchorHere(instance);
            }

            setMoved(false);
          }}
          /* Sits above the preview card, which rises from the bottom edge on
             a phone, and clear of the page navigation below it. */
          className="absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-raised text-ink shadow-tile"
          aria-label={MAP_LABELS.recentre}
        >
          <RecentreIcon size={20} />
        </button>
      )}
    </div>
  );
};

export default RestaurantMap;
