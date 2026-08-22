/**
 * The map provider, and the only file that names it outside `RestaurantMap`.
 *
 * Mapbox draws our own data and nothing else. Every restaurant on the map came
 * out of our PostgreSQL rows through the existing nearby and bounds queries —
 * panning, zooming, selecting a pin and "search this area" all resolve against
 * our database. Mapbox is never asked to find a restaurant, and neither is
 * Google: discovering a place we do not know is `MainSearchBar`'s job and
 * happens on a different screen entirely.
 *
 * That division is the reason the map is cheap to operate. A metered map that
 * only ever renders is billed per load; a metered map wired to a search box is
 * billed per keystroke.
 */

/**
 * A **public** token (`pk.…`), which is designed to ship in a browser bundle —
 * every Mapbox web map exposes one and there is no way not to.
 *
 * What protects it is a URL restriction on the token itself, set in the Mapbox
 * account. An unrestricted public token is somebody else's map budget. A
 * secret token (`sk.…`) must never appear here: those can edit styles, read
 * account data and mint more tokens.
 */
export const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || "";

/**
 * With no token there is no map, and the page says so by not offering one.
 *
 * A Map button that opens a grey rectangle with a 401 in the console is worse
 * than a page that only lists: the list is the half that always works, so
 * losing the map costs a reader nothing they cannot get another way.
 */
export const mapConfigured = (): boolean => MAPBOX_TOKEN.startsWith("pk.");

/**
 * Mapbox's own light and dark styles, switched with the app's theme.
 *
 * Restaurants are dim and the rest of this product already flips; a map that
 * stayed bright would be the one white rectangle in a dark page, which is the
 * bug the design system exists to prevent.
 */
export const MAP_STYLE = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
} as const;

export const MAP_VIEW = {
  DEFAULT_ZOOM: 14,
  /** Tapping a pin should not also fly the map somewhere. */
  SELECT_ZOOM: 15,
  MAX_ZOOM: 19,
} as const;

/**
 * What counts as having moved "enough" to offer a fresh search.
 *
 * Offered after any twitch, the button appears while somebody is still reading
 * the results they already have and invites a tap that re-runs the same query.
 * Both measures are relative to the current view, so they mean the same thing
 * at every zoom.
 */
export const MAP_MOVEMENT = {
  /** Fraction of the visible span the centre must cross. */
  PAN_FRACTION: 0.25,
  ZOOM_DELTA: 0.4,
} as const;

/**
 * Marker geometry. The visible dot is smaller than the target it carries:
 * a 32px pin inside a 44px hit area is the phone rule, and on a map it is the
 * difference between selecting a restaurant and panning by accident.
 */
export const MAP_MARKER = {
  SIZE: 32,
  SELECTED_SIZE: 40,
  /** Pointed at, but not chosen. Between the two, because hover is a preview
   * of a selection rather than a second kind of it. */
  HOVER_SIZE: 38,
  /** Padding around the dot, so the tap target reaches 44px. */
  TOUCH_PADDING: 6,
  /** The category glyph inside a pin. Small enough to sit inside the 32px
   * disc with a ring of colour still showing around it. */
  GLYPH_SIZE: 17,
} as const;

/**
 * When pins stop being readable individually.
 *
 * The marker file used to justify DOM markers on the grounds that the server
 * capped a map query at forty pins, so they could never smear — and warned
 * that raising the cap had to mean revisiting the decision rather than
 * stretching it. Paging raised it. This is the revisit: the pins group before
 * they are built, so the marker stays a `<div>` that can hold a photograph and
 * the map still reads at a city-wide zoom.
 */
export const MAP_CLUSTER = {
  /**
   * Screen distance below which two pins are one. Slightly wider than the
   * 44px touch target, so a cluster never hides a pin somebody could
   * otherwise have hit.
   */
  GRID_PX: 64,
  /** How far a tap on a cluster goes in. Two levels quarters the ground each
   * pixel covers, which reliably splits anything merely close. */
  ZOOM_STEP: 2,
  /** Two restaurants in one building cannot be separated by zooming, and
   * flying to street level to fail at it is worse than stopping. */
  MAX_ZOOM: 18,
  /** Geometry for the grouped marker. Bigger than a pin because it carries a
   * number that has to be readable at arm's length. */
  SIZE: 38,
  LARGE_SIZE: 46,
  /** Past this many, the marker grows. */
  LARGE_COUNT: 10,
} as const;

/**
 * Showing the reader where a restaurant they are pointing at actually is.
 *
 * Hovering a result used to highlight its marker only when that marker
 * happened to be drawn on its own. Inside a cluster the reader got nothing:
 * the cluster is a count, and "somewhere among these seven" does not answer
 * "where is Busy Bee Cafe".
 *
 * **A reveal is a preview, and a preview never mutates the view.** The zoom
 * the reader chose survives a mouse crossing a row — so a hidden place is
 * exposed by drawing one extra pin above its cluster at the restaurant's own
 * coordinates, not by zooming the map until the group splits. Mapbox's
 * `getClusterExpansionZoom` would do the second, and it is unavailable here
 * anyway: the grouping is ours (`utils/cluster.ts`) precisely so a marker can
 * stay a `<div>` that holds a photograph.
 */
export const MAP_REVEAL = {
  /**
   * How much of each edge counts as "not really on screen".
   *
   * A pin two pixels inside the frame is technically visible and practically
   * missed — and on a phone the bottom of the map is under the preview card.
   * Inside the inset box the camera stays still, which is the point: the map
   * must not lurch every time the pointer crosses a row.
   */
  EDGE_INSET: 0.15,
  /**
   * A short ease, never a flight. This can fire on a mouse moving down a
   * list, and a dramatic animation there is what makes an interface
   * irritating rather than responsive.
   */
  PAN_MS: 350,
  /** The name on a revealed pin. See `createReveal` for why only that one. */
  LABEL_MAX_PX: 168,
} as const;
