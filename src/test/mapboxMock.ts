/**
 * A stand-in for `mapbox-gl` under Jest.
 *
 * The real library wants WebGL and a laid-out container, and jsdom has
 * neither — imported for real it throws while constructing and takes down
 * every test that reaches the nearby page, which is most of them.
 *
 * What is left is deliberately not a pretend map. It is a recorder: which
 * markers were added, which handlers were registered, what the view was told
 * to do. Those are the things worth asserting about a map component anyway —
 * that no request fires while somebody drags, that the bounds handed upward
 * are the bounds that were on screen, that a pin can be tapped. Whether
 * Mapbox draws a road correctly is Mapbox's test, not ours.
 *
 * `emit` is the seam a test uses to say "the reader moved it".
 */

export interface FakeBounds {
  getNorth: () => number;
  getSouth: () => number;
  getEast: () => number;
  getWest: () => number;
}

type Handler = (event: { originalEvent?: unknown }) => void;

/** Whatever the current test most recently constructed. */
let built: FakeMap | null = null;

/** Read through a function: a live binding does not survive the import. */
export const lastMap = (): FakeMap | null => built;

export class FakeMap {
  handlers = new Map<string, Handler[]>();
  markers: FakeMarker[] = [];
  popups: FakePopup[] = [];
  controls: unknown[] = [];
  style: string;
  removed = false;

  private centre: { lng: number; lat: number };
  private zoom: number;
  /** A degree-ish span, so `farEnough` has something real to divide by. */
  private span = 0.02;

  constructor(options: {
    style: string;
    center: [number, number];
    zoom: number;
  }) {
    this.style = options.style;
    this.centre = { lng: options.center[0], lat: options.center[1] };
    this.zoom = options.zoom;
    built = this;
  }

  on(event: string, handler: Handler) {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
    return this;
  }

  /** Fire a registered handler the way the library would. */
  emit(event: string, payload: { originalEvent?: unknown } = {}) {
    (this.handlers.get(event) ?? []).forEach((handler) => handler(payload));
  }

  getCenter() {
    return this.centre;
  }

  getZoom() {
    return this.zoom;
  }

  getBounds(): FakeBounds {
    const half = this.span / 2;

    return {
      getNorth: () => this.centre.lat + half,
      getSouth: () => this.centre.lat - half,
      getEast: () => this.centre.lng + half,
      getWest: () => this.centre.lng - half,
    };
  }

  /** What a drag or a pinch does, for a test that wants to cause one. */
  moveTo(lng: number, lat: number, zoom = this.zoom) {
    this.centre = { lng, lat };
    this.zoom = zoom;
    this.emit("moveend", { originalEvent: new Event("mouseup") });
  }

  easeTo(options: { center: [number, number]; zoom?: number }) {
    this.centre = { lng: options.center[0], lat: options.center[1] };

    if (options.zoom != null) {
      this.zoom = options.zoom;
    }

    // No `originalEvent`: the component must not read its own camera moves as
    // the reader having gone looking somewhere else.
    this.emit("moveend", {});
  }

  setStyle(style: string) {
    this.style = style;
  }

  addControl(control: unknown) {
    this.controls.push(control);
    return this;
  }

  remove() {
    this.removed = true;

    if (built === this) {
      built = null;
    }
  }
}

export class FakeMarker {
  lngLat: [number, number] | null = null;
  map: FakeMap | null = null;

  constructor(private options: { element?: HTMLElement } = {}) {}

  setLngLat(point: [number, number]) {
    this.lngLat = point;
    return this;
  }

  addTo(map: FakeMap) {
    this.map = map;
    map.markers.push(this);

    // Attached for real, so a test can click a marker the way a reader does.
    if (this.options.element) {
      document.body.appendChild(this.options.element);
    }

    return this;
  }

  getElement() {
    return this.options.element ?? document.createElement("div");
  }

  remove() {
    this.options.element?.remove();

    if (this.map) {
      this.map.markers = this.map.markers.filter((one) => one !== this);
      this.map = null;
    }

    return this;
  }
}

/**
 * The name label beside a pin.
 *
 * A recorder like the rest of this file. What is worth asserting is that the
 * label is placed at the *restaurant's* coordinates rather than at a cluster
 * centre, that exactly one exists at a time, and that no anchor is pinned —
 * withholding it is what lets Mapbox flip the label away from a container
 * edge, and that flipping is the library's arithmetic rather than ours.
 */
export class FakePopup {
  lngLat: [number, number] | null = null;
  content: HTMLElement | null = null;
  map: FakeMap | null = null;

  constructor(public options: Record<string, unknown> = {}) {}

  setLngLat(point: [number, number]) {
    this.lngLat = point;
    return this;
  }

  setDOMContent(node: HTMLElement) {
    this.content = node;
    return this;
  }

  addTo(map: FakeMap) {
    this.map = map;
    map.popups.push(this);
    return this;
  }

  remove() {
    if (this.map) {
      this.map.popups = this.map.popups.filter((one) => one !== this);
      this.map = null;
    }

    return this;
  }
}

class FakeNavigationControl {}

const mapboxgl = {
  accessToken: "",
  Map: FakeMap,
  Marker: FakeMarker,
  Popup: FakePopup,
  NavigationControl: FakeNavigationControl,
  lastMap,
};

export default mapboxgl;
