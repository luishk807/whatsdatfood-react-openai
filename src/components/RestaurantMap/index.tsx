import { type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { RecentreIcon } from "@/components/icons";
import {
  MAP_MOVEMENT,
  MAP_STYLE,
  MAP_VIEW,
  MAPBOX_TOKEN,
} from "@/customConstants/map";
import { MAP_LABELS } from "@/customConstants/labels";
import { THEME } from "@/customConstants/theme";
import useTheme from "@/customHooks/useTheme";
import { RestaurantMapInterface } from "@/interfaces/location";
import { clusterPlaces, zoomIntoCluster } from "@/utils/cluster";
import { createCluster, createMarker, paintMarker } from "./markers";

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
const RestaurantMap: FC<RestaurantMapInterface> = ({
  places,
  centre,
  showMe,
  selectedId,
  onSelect,
  onSearchArea,
  onRecentre,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const me = useRef<mapboxgl.Marker | null>(null);
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

  // Read inside a listener that is created once, so it goes through a ref.
  // Re-subscribing whenever the selection changed would drop the very click
  // that changed it.
  const select = useRef(onSelect);
  select.current = onSelect;

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

    map.current = instance;

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current.clear();
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

      markers.current.set(
        place.id,
        new mapboxgl.Marker({ element }).setLngLat(point).addTo(instance),
      );
    });
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
        paintMarker(element, place, { selected: place.id === selectedId });
      }
    });
  }, [selectedId, clusters]);

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
