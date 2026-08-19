import { type FC, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { NEARBY } from "@/customConstants/location";
import { MAP_LABELS } from "@/customConstants/labels";
import { RestaurantMapInterface } from "@/interfaces/location";

/**
 * The map half of nearby discovery.
 *
 * **Leaflet and OpenStreetMap tiles, chosen for not needing a key.** Google
 * Maps and Mapbox both bill per map load and both want a billing account
 * before the first pin renders; this product has no traffic yet and no reason
 * to take on a metered dependency to draw sixteen restaurants. The seam is
 * this one component — the page above it passes places and receives bounds,
 * and knows nothing about the provider. See the note in the README about
 * OSM's tile usage policy before this gets real traffic.
 *
 * **Leaflet is imperative, so it lives behind a ref and is never re-created.**
 * Tearing the map down on every render loses the reader's pan and zoom, which
 * is the whole interaction. The markers are the only thing that gets rebuilt.
 *
 * **This is not the only way to read the results.** The list beside it carries
 * the same places in the same order — a map is unusable with a keyboard and a
 * screen reader, and it is decorative here rather than load-bearing.
 */
const RestaurantMap: FC<RestaurantMapInterface> = ({
  places,
  centre,
  selectedId,
  onSelect,
  onSearchArea,
  onRecentre,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<Map<string, L.CircleMarker>>(new Map());
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    if (!container.current || map.current) {
      return;
    }

    const instance = L.map(container.current, {
      center: [centre.latitude, centre.longitude],
      zoom: NEARBY.DEFAULT_ZOOM,
      // The default control sits top-left over the first row of pins on a
      // phone, and pinch is the gesture anybody actually uses.
      zoomControl: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      // Required by the tile usage policy, and it is the only credit the
      // people who made this map get.
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(instance);

    instance.on("moveend", () => setMoved(true));
    map.current = instance;

    return () => {
      instance.remove();
      map.current = null;
    };
    // Once. `centre` moving must pan the existing map, not build a new one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentre when the reader picks a different place, without disturbing the
  // zoom they chose.
  useEffect(() => {
    map.current?.setView(
      [centre.latitude, centre.longitude],
      map.current.getZoom(),
    );
    setMoved(false);
  }, [centre.latitude, centre.longitude]);

  useEffect(() => {
    const instance = map.current;

    if (!instance) {
      return;
    }

    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();

    places.forEach((place) => {
      if (place.latitude == null || place.longitude == null) {
        return;
      }

      // A circle rather than an image pin: no asset to load, no broken icon
      // when the bundler moves the file, and it takes a colour token.
      const marker = L.circleMarker([place.latitude, place.longitude], {
        radius: 9,
        weight: 2,
        color: "#ffffff",
        fillColor: place.top_dish_photo_url ? "#1f8a4c" : "#8a8a8a",
        fillOpacity: 1,
      })
        .addTo(instance)
        // Keyboard and screen-reader users get the list; this is for the
        // pointer users who are looking at the pin.
        .bindTooltip(place.name, { direction: "top" })
        .on("click", () => onSelect?.(place.id));

      markers.current.set(place.id, marker);
    });
  }, [places, onSelect]);

  // The selected pin grows rather than changing colour alone: colour is not
  // the only signal for anything here.
  useEffect(() => {
    markers.current.forEach((marker, id) => {
      marker.setRadius(id === selectedId ? 13 : 9);
    });
  }, [selectedId, places]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={container}
        role="application"
        aria-label={MAP_LABELS.label}
        className="h-full w-full"
      />

      {/* Only after the reader has moved it. Offered before, it invites a tap
          that re-runs the search they just got. */}
      {moved && onSearchArea && (
        <button
          type="button"
          onClick={() => {
            const bounds = map.current?.getBounds();

            if (!bounds) {
              return;
            }

            setMoved(false);
            onSearchArea({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            });
          }}
          className="absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-pill bg-surface-raised px-4 py-2 text-sm font-medium text-ink shadow-tile"
        >
          {MAP_LABELS.searchThisArea}
        </button>
      )}

      {onRecentre && (
        <button
          type="button"
          onClick={() => {
            onRecentre();
            map.current?.setView(
              [centre.latitude, centre.longitude],
              NEARBY.DEFAULT_ZOOM,
            );
            setMoved(false);
          }}
          className="absolute bottom-3 right-3 z-[500] flex h-11 w-11 items-center justify-center rounded-full bg-surface-raised text-ink shadow-tile"
          aria-label={MAP_LABELS.recentre}
        >
          ◎
        </button>
      )}
    </div>
  );
};

export default RestaurantMap;
