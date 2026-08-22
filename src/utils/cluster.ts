import { MAP_CLUSTER, MAP_REVEAL } from "@/customConstants/map";
import {
  CoordinatesType,
  MapBoundsType,
  NearbyPlaceType,
  PlaceClusterType,
} from "@/interfaces/location";

/**
 * Grouping pins that would otherwise land on top of each other.
 *
 * **Why this is arithmetic here rather than Mapbox's own clustering.** The
 * library clusters a GeoJSON source through circle and symbol layers styled
 * with Mapbox expressions, and `markers.ts` deliberately builds DOM markers so
 * that a dish photograph on a pin is an `<img>` rather than a sprite loaded
 * into the style. Switching to a clustered source to get clustering would
 * throw that away — so the grouping is done before the markers are built, and
 * the marker file never learns that clusters exist beyond being handed a
 * count.
 *
 * **Pixels, not degrees.** Two restaurants a hundred metres apart overlap at
 * zoom 12 and are comfortably separate at zoom 17, so the threshold has to be
 * measured on the screen. Everything is projected to Web Mercator pixels at
 * the current zoom and bucketed on a fixed grid, which means "closer together
 * than `GRID_PX` on screen" means the same thing at every zoom level.
 *
 * **A lone pin is a cluster of one.** The caller then has a single list to
 * render rather than two, and cannot accidentally draw a restaurant twice.
 *
 * Pure, and deliberately so: this is the part worth testing, and it can be
 * tested without a map.
 */

/** Mercator, in pixels, at a given zoom. The standard 256px tile scheme. */
export const project = (
  latitude: number,
  longitude: number,
  zoom: number,
): { x: number; y: number } => {
  const worldSize = 256 * 2 ** zoom;
  // Clamped to the projection's own limits. Mercator goes to infinity at the
  // poles, and a NaN here would put a marker nowhere at all.
  const lat = Math.max(-85.05112878, Math.min(85.05112878, latitude));
  const sin = Math.sin((lat * Math.PI) / 180);

  return {
    x: ((longitude + 180) / 360) * worldSize,
    y:
      (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * worldSize,
  };
};

/**
 * The places, grouped for the zoom they are about to be drawn at.
 *
 * Order is stable: clusters come back sorted by their first member's position
 * in the input, so a repaint does not reshuffle the pins under the reader's
 * finger.
 */
export const clusterPlaces = (
  places: NearbyPlaceType[],
  zoom: number,
  gridPx: number = MAP_CLUSTER.GRID_PX,
): PlaceClusterType[] => {
  const buckets = new Map<string, NearbyPlaceType[]>();

  places.forEach((place) => {
    if (place.latitude == null || place.longitude == null) {
      // Never geocoded. Absent from the map rather than placed at a guess,
      // and still present in the list beside it.
      return;
    }

    const point = project(place.latitude, place.longitude, zoom);
    const key = `${Math.floor(point.x / gridPx)}:${Math.floor(point.y / gridPx)}`;

    buckets.set(key, [...(buckets.get(key) ?? []), place]);
  });

  return [...buckets.entries()].map(([key, members]) => ({
    // Keyed on the cell and its occupants, so React reuses a marker that has
    // not actually changed and replaces one that has.
    id: `${key}:${members.map((one) => one.id).join(",")}`,
    // The middle of what is in the cell, rather than the middle of the cell:
    // a cluster of two restaurants at one end of a cell should sit on them,
    // not float in empty space beside them.
    latitude: mean(members.map((one) => one.latitude as number)),
    longitude: mean(members.map((one) => one.longitude as number)),
    places: members,
  }));
};

const mean = (values: number[]): number =>
  values.reduce((total, one) => total + one, 0) / values.length;

/**
 * How far in to go when somebody taps a cluster.
 *
 * Enough that the cell splits — one zoom level halves the ground each pixel
 * covers, so two steps reliably separates anything that was merely close
 * rather than co-located. Capped, because a restaurant sharing a building
 * with another cannot be separated by zooming and flying to street level to
 * fail at it is worse than stopping.
 *
 * **Tapping a cluster is never a search.** It is a camera move over pins
 * already in hand — the same rule as tapping a single marker.
 */
export const zoomIntoCluster = (zoom: number): number =>
  Math.min(zoom + MAP_CLUSTER.ZOOM_STEP, MAP_CLUSTER.MAX_ZOOM);

/**
 * Which drawn cluster is hiding a given place, and whether it is hiding it.
 *
 * Hovering a result highlighted its marker only when that marker happened to
 * be drawn on its own. Inside a cluster the reader got nothing useful — the
 * cluster is a count, and "somewhere among these seven" is not an answer to
 * "where is Busy Bee Cafe".
 *
 * This is the lookup the map needs to answer that. Returning the cluster
 * rather than a boolean lets the caller tell the two cases apart without
 * searching twice: a cluster of one is the place's own marker and needs only
 * emphasis, while a cluster of several is hiding it and has to be opened up.
 *
 * Pure, because the alternative is the map recomputing geography to find
 * something it has already grouped.
 */
export const findCluster = (
  clusters: PlaceClusterType[],
  placeId?: string | null,
): PlaceClusterType | null => {
  if (!placeId) {
    return null;
  }

  return (
    clusters.find((cluster) =>
      cluster.places.some((place) => place.id === placeId),
    ) ?? null
  );
};

/**
 * The place itself, out of whatever cluster holds it.
 *
 * Its real coordinates, not the cluster's centre — the whole point is to say
 * where this restaurant actually is, and a cluster centre is an average that
 * may sit on none of its members.
 */
export const placeInClusters = (
  clusters: PlaceClusterType[],
  placeId?: string | null,
): NearbyPlaceType | null => {
  const cluster = findCluster(clusters, placeId);

  return cluster?.places.find((place) => place.id === placeId) ?? null;
};

/**
 * Whether a point is comfortably on screen, rather than merely on screen.
 *
 * This is what decides if pointing at a result moves the camera at all. The
 * rule is "only when it has to": a pin already in view is emphasised where it
 * stands, because a map that re-centres every time the pointer crosses a row
 * is unusable, and the reader loses the frame they were comparing places in.
 *
 * The inset is why "has to" is generous. A marker two pixels inside the frame
 * is visible to a bounds check and missed by a person, and on a phone the
 * bottom strip of the map is under the preview card. Measured as a fraction
 * of the visible span, so it means the same thing at every zoom.
 *
 * Pure, and deliberately: this is the arithmetic worth testing, and it needs
 * no WebGL to test.
 */
export const insideView = (
  view: MapBoundsType,
  point: Partial<CoordinatesType>,
  inset: number = MAP_REVEAL.EDGE_INSET,
): boolean => {
  if (point.latitude == null || point.longitude == null) {
    // Never geocoded, so it is on no screen anywhere. Reported as inside so
    // that nothing tries to fly to a restaurant that has no position — the
    // list still carries it.
    return true;
  }

  const height = Math.abs(view.north - view.south);
  const width = Math.abs(view.east - view.west);
  const padY = height * inset;
  const padX = width * inset;

  return (
    point.latitude <= view.north - padY &&
    point.latitude >= view.south + padY &&
    point.longitude <= view.east - padX &&
    point.longitude >= view.west + padX
  );
};
