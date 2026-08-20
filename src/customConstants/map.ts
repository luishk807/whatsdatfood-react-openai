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
  /** Padding around the dot, so the tap target reaches 44px. */
  TOUCH_PADDING: 6,
} as const;
