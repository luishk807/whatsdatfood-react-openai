import { MapBoundsType, CoordinatesType } from "@/interfaces/location";

/**
 * Rounding coordinates before they become a cache key.
 *
 * Three decimals is about 110 metres, and it does two jobs at once.
 *
 * **It makes the cache work.** A GPS fix differs in the sixth decimal place
 * between one reading and the next, so an unrounded point is a fresh cache
 * key every time the browser re-reads the device — a new network request for
 * a list of restaurants that cannot have moved. Rounded, walking around a
 * block reuses the same answer.
 *
 * **And it is the same rounding the server already applies** to a stored
 * discovery area, for the reason given there: enough to centre a search, not
 * enough to name a building. Coordinates never reach a URL, and this is the
 * matching restraint one layer up.
 */
export const COORDINATE_PRECISION = 3;

const round = (value: number, places: number): number => {
  const factor = 10 ** places;

  return Math.round(value * factor) / factor;
};

export const roundPoint = <T extends CoordinatesType>(
  point: T | null,
): T | null =>
  point
    ? {
        ...point,
        latitude: round(point.latitude, COORDINATE_PRECISION),
        longitude: round(point.longitude, COORDINATE_PRECISION),
      }
    : null;

/**
 * The same treatment for a map viewport, at a coarser step.
 *
 * A map bound carries however many decimals the projection produced, and two
 * "search this area" taps from what looks like the same view differ in the
 * eighth — so every tap was a fresh query for a result already in hand. Two
 * decimals is roughly a kilometre, which is well inside the movement the map
 * already requires before it offers the search at all.
 *
 * Rounded **outward**, never to nearest: a box that shrank could drop a
 * restaurant the reader can see a pin for.
 */
export const BOUNDS_PRECISION = 2;

export const normalizeBounds = (bounds: MapBoundsType): MapBoundsType => {
  const factor = 10 ** BOUNDS_PRECISION;

  return {
    north: Math.ceil(bounds.north * factor) / factor,
    east: Math.ceil(bounds.east * factor) / factor,
    south: Math.floor(bounds.south * factor) / factor,
    west: Math.floor(bounds.west * factor) / factor,
  };
};
