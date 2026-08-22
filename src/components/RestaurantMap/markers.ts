import { MAP_CLUSTER, MAP_MARKER, MAP_REVEAL } from "@/customConstants/map";
import { NearbyPlaceType, PlaceClusterType } from "@/interfaces/location";

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
 * that future list. Mapbox's own clustering wants circle and symbol layers
 * styled with expressions, where a per-restaurant photograph means loading
 * every image into the style as a sprite. A dish photo in a `<div>` is an
 * `<img>`.
 *
 * That trade used to be paid for by the server capping a map query at forty
 * pins — with the note that raising the cap meant revisiting this rather than
 * stretching it. Paging raised it. **This is the revisit, and the decision
 * stands**: the grouping moved to `utils/cluster.ts`, which runs before any
 * marker is built, so pins thin out at low zoom while the marker itself stays
 * a `<div>` that can hold a photograph. The map is handed groups and never
 * learns how they were formed.
 */
export interface MarkerState {
  /** Chosen, and it stays chosen after the pointer leaves. */
  selected: boolean;
  /**
   * Pointed at right now — from a mouse over the row, a keyboard focus on it,
   * or the pointer on the pin itself. A preview, so it is drawn between plain
   * and selected and it is drawn *above* both: it is the one the reader is
   * asking about this instant.
   */
  hovered?: boolean;
}

const ROOT_CLASS = "wdf-marker";

/** Roles the map reads to find where a glyph goes. */
const PIN = "pin";
const FACE = "face";
const LABEL = "label";

const has = (place: NearbyPlaceType): boolean =>
  Boolean(place.top_dish_photo_url);

/**
 * Where a category glyph goes.
 *
 * The three nested nodes were built for exactly this: `root` is the tap
 * target, `pin` is the drawn shape and `face` is the slot. The map renders a
 * React icon into it through a portal, so the marker shares one taxonomy with
 * the taste picker, the homepage tiles and the nearby list rather than
 * carrying a second copy of it in raw SVG.
 */
export const markerFace = (root: HTMLElement): HTMLElement | null =>
  root.querySelector<HTMLElement>(`[data-role="${FACE}"]`);

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
  // Centres whatever is rendered into it — a category glyph today, a dish
  // photograph the day markers carry one.
  face.style.display = "flex";
  face.style.alignItems = "center";
  face.style.justifyContent = "center";
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

  const active = state.selected || state.hovered;
  const size = state.selected
    ? MAP_MARKER.SELECTED_SIZE
    : state.hovered
      ? MAP_MARKER.HOVER_SIZE
      : MAP_MARKER.SIZE;

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

  // The glyph inherits this, so it stays legible on both grounds: white on
  // the brand disc a photographed restaurant gets, ink on the plain one.
  const face = root.querySelector<HTMLElement>(`[data-role="${FACE}"]`);

  if (face) {
    face.style.color = has(place) ? "#fff" : "var(--color-ink-muted)";
  }
  // One ring means one thing — "this is the restaurant you are asking
  // about" — whether the reader is pointing at it or has chosen it. Two
  // different marks for hover and selection would make the reader learn a
  // vocabulary to read a map.
  pin.style.border = active
    ? "3px solid var(--color-ink)"
    : `2px solid ${
        has(place) ? "var(--color-surface-raised)" : "var(--color-line)"
      }`;
  pin.style.boxShadow = active
    ? "0 4px 12px rgb(0 0 0 / 0.35)"
    : "0 1px 4px rgb(0 0 0 / 0.25)";

  // Lifted clear of its neighbours, which is half of what "reveal it" means
  // on a map where pins overlap. Hover sits above selection: it is the more
  // recent question, and it is the transient one.
  root.style.zIndex = state.hovered ? "3" : state.selected ? "2" : "1";
};


// --- groups ---------------------------------------------------------------

const CLUSTER_CLASS = "wdf-cluster";

/**
 * A group of restaurants too close together to draw separately.
 *
 * Deliberately unlike a pin rather than a bigger one: a reader has to be able
 * to tell "one restaurant" from "eight restaurants" without counting pixels,
 * so this is a filled disc carrying a number where a pin is a ring.
 *
 * **It is a camera control, not a result.** Tapping it zooms in on places
 * already in hand — no query, no request, nothing billed. That is the same
 * promise tapping a single pin makes, and it is why zooming into a cluster
 * must never be read as permission to search.
 */
export const createCluster = (
  cluster: PlaceClusterType,
  onZoom: () => void,
): HTMLElement => {
  const root = document.createElement("div");
  root.className = CLUSTER_CLASS;
  root.dataset.clusterCount = String(cluster.places.length);
  // The list beside the map carries every one of these restaurants in the
  // same order, so the map is a second way to reach them rather than the only
  // one. Announcing a group whose members are all already in the list would
  // put a stop in front of the readable half for no new information.
  root.setAttribute("aria-hidden", "true");
  root.style.cursor = "pointer";
  root.style.padding = `${MAP_MARKER.TOUCH_PADDING}px`;
  root.style.lineHeight = "0";

  const disc = document.createElement("span");
  const big = cluster.places.length >= MAP_CLUSTER.LARGE_COUNT;
  const size = big ? MAP_CLUSTER.LARGE_SIZE : MAP_CLUSTER.SIZE;

  disc.style.display = "flex";
  disc.style.alignItems = "center";
  disc.style.justifyContent = "center";
  disc.style.width = `${size}px`;
  disc.style.height = `${size}px`;
  disc.style.borderRadius = "9999px";
  disc.style.boxSizing = "border-box";
  // Tokens, not hexes: the map flips with the rest of the page, and a marker
  // painted in a literal colour is the one thing that does not.
  disc.style.background = "var(--color-surface-raised)";
  disc.style.border = "2px solid var(--color-ink)";
  disc.style.color = "var(--color-ink)";
  disc.style.fontSize = big ? "13px" : "12px";
  disc.style.fontWeight = "600";
  disc.style.boxShadow = "0 2px 8px rgb(0 0 0 / 0.25)";
  disc.textContent = String(cluster.places.length);

  root.appendChild(disc);
  root.addEventListener("click", (event) => {
    // Otherwise the map also sees a click on the canvas and clears the
    // selection in the same tick.
    event.stopPropagation();
    onZoom();
  });

  return root;
};

// --- revealing one place inside a group -----------------------------------

const REVEAL_CLASS = "wdf-reveal";

/**
 * The pin for a restaurant that is currently hidden inside a cluster.
 *
 * **This is the answer to "where is Busy Bee Cafe" when Busy Bee Cafe is one
 * of seven dots drawn as a single "7".** Highlighting the cluster does not
 * answer it — the reader learns the restaurant is somewhere in a group they
 * still cannot see into. So the place is drawn again, on its own, at its own
 * coordinates, above the group.
 *
 * **Its own coordinates, never the cluster's centre.** The centre is an
 * average that may sit on none of its members, and the whole promise here is
 * "it is *right there*".
 *
 * **Zoom is not touched.** Splitting the cluster for real would mean zooming,
 * and a mouse crossing a list would then rewrite the view the reader chose —
 * they would come back to a map they had never navigated to. A preview that
 * mutates the thing it is previewing is not a preview. (Mapbox's
 * `getClusterExpansionZoom`/`getClusterLeaves` are the API for doing it that
 * way and are unavailable to us regardless: the grouping is ours, in
 * `utils/cluster.ts`, so that a marker stays a `<div>` that can hold a dish
 * photograph rather than a sprite in a symbol layer.)
 *
 * **This is the one marker that carries a name**, and the exception earns
 * itself: every other pin is identifiable by standing alone where the reader
 * pointed, while this one appears on top of a group and would otherwise just
 * be an eighth dot. The preview card names it too, but that is in the corner
 * of the map and reading it means looking away from the pin.
 *
 * The label is positioned absolutely so it stays out of the layout box.
 * Mapbox anchors a marker on the centre of its element: a label in normal
 * flow would push the pin upward off the coordinate it exists to point at.
 */
export const createReveal = (place: NearbyPlaceType): HTMLElement => {
  const root = createMarker(place, { selected: true, hovered: true });

  root.className = `${ROOT_CLASS} ${REVEAL_CLASS}`;
  root.dataset.reveal = "true";
  root.style.position = "relative";
  // Above every ordinary pin and every cluster, including the one it is
  // standing on.
  root.style.zIndex = "5";

  const label = document.createElement("span");

  label.dataset.role = LABEL;
  label.textContent = place.name;
  label.style.position = "absolute";
  label.style.top = "100%";
  label.style.left = "50%";
  label.style.transform = "translateX(-50%)";
  label.style.marginTop = "2px";
  label.style.maxWidth = `${MAP_REVEAL.LABEL_MAX_PX}px`;
  label.style.overflow = "hidden";
  label.style.textOverflow = "ellipsis";
  label.style.whiteSpace = "nowrap";
  label.style.padding = "2px 6px";
  label.style.borderRadius = "9999px";
  // Tokens, not hexes: this is drawn over a map that flips with the page.
  label.style.background = "var(--color-surface-raised)";
  label.style.border = "1px solid var(--color-ink)";
  label.style.color = "var(--color-ink)";
  label.style.fontSize = "11px";
  label.style.fontWeight = "600";
  label.style.lineHeight = "1.4";
  label.style.pointerEvents = "none";
  label.style.boxShadow = "0 2px 8px rgb(0 0 0 / 0.25)";

  root.appendChild(label);

  return root;
};
