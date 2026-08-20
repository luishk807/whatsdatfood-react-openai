import { MAP_MARKER } from "@/customConstants/map";
import { NearbyPlaceType } from "@/interfaces/location";

/**
 * What a restaurant looks like on the map, and the only place that decides.
 *
 * Split out from the map itself because the pin is the part with a future.
 * Today it is a dot whose colour says whether anybody has photographed the
 * food there; the intended next versions are a dish thumbnail, a trending
 * mark, a community rank and an owner-verified tick. Those are all changes to
 * this file, and the map does not learn about any of them: it asks for an
 * element and puts it at a coordinate.
 *
 * The structure below is deliberately three nested nodes rather than one.
 * `root` is the tap target, `pin` is the drawn shape, and `face` is where a
 * photograph or a glyph goes when there is one — so adding a thumbnail later
 * is filling a node that already exists at the right size, rather than
 * rebuilding the geometry every marker depends on.
 *
 * **DOM markers rather than a clustered GeoJSON layer**, and the reason is
 * that future list. Clustering wants circle and symbol layers styled with
 * Mapbox expressions, where a per-restaurant photograph means loading every
 * image into the style as a sprite. A dish photo in a `<div>` is an `<img>`.
 * The trade is that DOM markers do not thin themselves out at low zoom, which
 * is affordable only because the server caps a map query at `NEARBY.MAP_LIMIT`
 * — forty pins never overlap into a smear. Raise that cap and this decision
 * has to be revisited rather than stretched.
 */
export interface MarkerState {
  selected: boolean;
}

const ROOT_CLASS = "wdf-marker";

/** Roles the map never reads; they exist so tests and future work can. */
const PIN = "pin";
const FACE = "face";

const has = (place: NearbyPlaceType): boolean =>
  Boolean(place.top_dish_photo_url);

export const createMarker = (
  place: NearbyPlaceType,
  state: MarkerState,
): HTMLElement => {
  const root = document.createElement("div");
  root.className = ROOT_CLASS;
  root.dataset.placeId = place.id;
  // The list beside the map carries every one of these in the same order, so
  // a pin is a second way to reach a restaurant rather than the only one.
  // Announcing forty of them would put forty stops before the readable half.
  root.setAttribute("aria-hidden", "true");
  root.style.cursor = "pointer";
  root.style.padding = `${MAP_MARKER.TOUCH_PADDING}px`;
  root.style.lineHeight = "0";

  const pin = document.createElement("span");
  pin.dataset.role = PIN;
  pin.style.display = "block";
  pin.style.borderRadius = "9999px";
  pin.style.boxSizing = "border-box";
  pin.style.transition = "width 120ms, height 120ms";

  const face = document.createElement("span");
  face.dataset.role = FACE;
  face.style.display = "block";
  face.style.width = "100%";
  face.style.height = "100%";
  face.style.borderRadius = "9999px";
  face.style.overflow = "hidden";

  pin.appendChild(face);
  root.appendChild(pin);
  paintMarker(root, place, state);

  return root;
};

/**
 * Update in place. Rebuilding the element on selection makes Mapbox drop and
 * re-add it, which flickers and loses the pointer that is mid-tap.
 */
export const paintMarker = (
  root: HTMLElement,
  place: NearbyPlaceType,
  state: MarkerState,
): void => {
  const pin = root.querySelector<HTMLElement>(`[data-role="${PIN}"]`);

  if (!pin) {
    return;
  }

  const size = state.selected ? MAP_MARKER.SELECTED_SIZE : MAP_MARKER.SIZE;

  pin.style.width = `${size}px`;
  pin.style.height = `${size}px`;

  // Tokens, not hexes: the map flips with the rest of the page, and a marker
  // painted in a literal colour is the one thing that does not.
  //
  // Brand marks a restaurant somebody has photographed. It is the vote's
  // colour and this is the closest thing the map has to a vote — everywhere
  // else on the map is a place still waiting for its first picture.
  pin.style.background = has(place)
    ? "var(--color-brand)"
    : "var(--color-surface-raised)";
  pin.style.border = state.selected
    ? "3px solid var(--color-ink)"
    : `2px solid ${
        has(place) ? "var(--color-surface-raised)" : "var(--color-line)"
      }`;
  pin.style.boxShadow = state.selected
    ? "0 4px 12px rgb(0 0 0 / 0.35)"
    : "0 1px 4px rgb(0 0 0 / 0.25)";

  root.style.zIndex = state.selected ? "2" : "1";
};

/** Where a marker sits, or null for a restaurant we never geocoded. */
export const markerPoint = (
  place: NearbyPlaceType,
): [number, number] | null =>
  place.longitude == null || place.latitude == null
    ? null
    : [place.longitude, place.latitude];
