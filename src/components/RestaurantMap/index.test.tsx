import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RestaurantMap from "@/components/RestaurantMap";
import mapboxgl, { FakeMap } from "@/test/mapboxMock";
import { MAP_LABELS } from "@/customConstants/labels";
import { NearbyPlaceType } from "@/interfaces/location";

/**
 * The map is a recorder under test — see `src/test/mapboxMock.ts`. What is
 * asserted here is the contract the page depends on: that moving the map
 * costs nothing until somebody asks, that the bounds handed up are the ones
 * that were on screen, and that a restaurant we never geocoded is left off
 * rather than placed at a guess.
 */
const place = (over: Partial<NearbyPlaceType> = {}): NearbyPlaceType => ({
  id: "1",
  slug: "luger",
  name: "Peter Luger",
  distance_km: 1.2,
  latitude: 40.71,
  longitude: -73.96,
  ...over,
});

const centre = { latitude: 40.71, longitude: -73.96 };

const show = (props: Partial<Parameters<typeof RestaurantMap>[0]> = {}) =>
  render(
    <MemoryRouter>
      <RestaurantMap places={[place()]} centre={centre} {...props} />
    </MemoryRouter>,
  );

/** The instance the component built, which the mock hands back. */
const instance = (): FakeMap => {
  const map = mapboxgl.lastMap();

  if (!map) {
    throw new Error("no map was constructed");
  }

  return map;
};

describe("RestaurantMap", () => {
  it("puts a marker on each restaurant that has coordinates", () => {
    // Far enough apart to stay separate pins. Two restaurants at the *same*
    // coordinates are one marker now, which is the clustering below.
    show({
      places: [
        place(),
        place({ id: "2", name: "Russ & Daughters", latitude: 40.79 }),
      ],
    });

    expect(instance().markers).toHaveLength(2);
  });

  it("leaves a restaurant with no coordinates off the map", () => {
    // It is still in the list beside it. A pin at a guessed point is a claim
    // about where a business is.
    show({
      places: [place({ id: "2", latitude: undefined, longitude: undefined })],
    });

    expect(instance().markers).toHaveLength(0);
  });

  it("does not offer to search the area before the map has moved", () => {
    show({ onSearchArea: jest.fn() });

    expect(
      screen.queryByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).not.toBeInTheDocument();
  });

  it("does not offer to search the area after a nudge", () => {
    // Offered for every twitch, the button appears while somebody is still
    // reading the results they have and invites a tap that re-runs them.
    show({ onSearchArea: jest.fn() });

    act(() => instance().moveTo(-73.9601, 40.7101));

    expect(
      screen.queryByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).not.toBeInTheDocument();
  });

  it("offers to search the area once the reader is looking elsewhere", () => {
    show({ onSearchArea: jest.fn() });

    act(() => instance().moveTo(-73.9, 40.75));

    expect(
      screen.getByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).toBeInTheDocument();
  });

  it("never fetches while the map is being moved", async () => {
    // The whole cost argument for this screen. Dragging is free; only the
    // tap spends a query.
    const onSearchArea = jest.fn();
    show({ onSearchArea });

    act(() => instance().moveTo(-73.9, 40.75));
    expect(onSearchArea).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: MAP_LABELS.searchThisArea }),
    );

    expect(onSearchArea).toHaveBeenCalledTimes(1);
  });

  it("hands up the bounds that were on screen", async () => {
    const onSearchArea = jest.fn();
    show({ onSearchArea });

    act(() => instance().moveTo(-73.9, 40.75));
    await userEvent.click(
      screen.getByRole("button", { name: MAP_LABELS.searchThisArea }),
    );

    const bounds = onSearchArea.mock.calls[0][0];

    expect(bounds.north).toBeGreaterThan(bounds.south);
    expect(bounds.east).toBeGreaterThan(bounds.west);
    expect(bounds.north).toBeCloseTo(40.76, 2);
    expect(bounds.west).toBeCloseTo(-73.91, 2);
  });

  it("stops offering the search once it has been run", async () => {
    const onSearchArea = jest.fn();
    show({ onSearchArea });

    act(() => instance().moveTo(-73.9, 40.75));
    await userEvent.click(
      screen.getByRole("button", { name: MAP_LABELS.searchThisArea }),
    );

    expect(
      screen.queryByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).not.toBeInTheDocument();
  });

  it("does not read its own camera move as the reader going looking", () => {
    // Recentring is something the page did, not something the reader asked
    // for, and offering "search this area" afterwards is offering to re-run
    // the search that just landed.
    show({ onSearchArea: jest.fn() });

    act(() =>
      instance().easeTo({ center: [-73.9, 40.75] as [number, number] }),
    );

    expect(
      screen.queryByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).not.toBeInTheDocument();
  });

  it("tells the page which restaurant was tapped", async () => {
    const onSelect = jest.fn();
    show({ onSelect });

    await userEvent.click(instance().markers[0].getElement());

    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("groups restaurants that would otherwise overlap", () => {
    // Twenty metres apart, at a zoom where that is one dot. Drawing them
    // separately is the smear clustering exists to prevent.
    show({
      places: [
        place(),
        place({ id: "2", latitude: 40.7102, longitude: -73.9602 }),
        place({ id: "3", latitude: 40.7104, longitude: -73.9601 }),
      ],
    });

    expect(instance().markers).toHaveLength(1);
    expect(
      instance().markers[0].getElement().dataset.clusterCount,
    ).toBe("3");
  });

  it("never fetches because a cluster was tapped", async () => {
    // A cluster is a camera control, not a result. Zooming into one moves
    // over places already in hand — no query, nothing billed. If this ever
    // fails, browsing the map has grown a bill.
    const onSearchArea = jest.fn();
    const onSelect = jest.fn();

    show({
      onSearchArea,
      onSelect,
      places: [
        place(),
        place({ id: "2", latitude: 40.7102, longitude: -73.9602 }),
      ],
    });

    await userEvent.click(instance().markers[0].getElement());

    expect(onSearchArea).not.toHaveBeenCalled();
    // And it is not a selection either — there is no single restaurant to
    // preview yet.
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("does not offer to search the area after zooming into a cluster", () => {
    // The camera moved, but the reader did not go looking somewhere else.
    // Offering the search here invites a tap that re-runs what is on screen.
    const onSearchArea = jest.fn();

    show({
      onSearchArea,
      places: [
        place(),
        place({ id: "2", latitude: 40.7102, longitude: -73.9602 }),
      ],
    });

    act(() => {
      instance().markers[0].getElement().click();
    });

    expect(
      screen.queryByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).not.toBeInTheDocument();
  });

  it("splits a cluster once the reader is close enough", () => {
    // The promise a cluster makes when it is tapped: there really are
    // separate restaurants in there.
    show({
      places: [
        place(),
        place({ id: "2", latitude: 40.7102, longitude: -73.9602 }),
      ],
    });

    expect(instance().markers).toHaveLength(1);

    act(() => instance().moveTo(-73.96, 40.71, 18));

    expect(instance().markers).toHaveLength(2);
  });

  it("draws the reader only when the fix was measured", () => {
    // A typed place is an area. A dot in the middle of Flushing claims a
    // precision nobody gave us.
    show({ showMe: false });
    expect(instance().markers).toHaveLength(1);

    show({ showMe: true });
    expect(instance().markers).toHaveLength(2);
  });
});

describe("what an individual pin says it is", () => {
  it("draws the restaurant's category rather than an empty circle", () => {
    // The reported problem: once a cluster broke apart, every place was the
    // same white dot and the only way to learn what any of them were was to
    // click all of them.
    show({ places: [place({ cuisine: "chinese" })] });

    const marker = instance().markers[0].getElement();

    expect(marker.querySelector("svg")).toBeInTheDocument();
  });

  it("draws a category even when the cuisine column is empty", () => {
    // Which is most of the catalogue — the classifier reads a menu and 6,783
    // of 6,786 restaurants have none. `Oh! Bagel Cafe` is the reported case.
    show({
      places: [place({ name: "Oh! Bagel Cafe", cuisine: undefined })],
    });

    expect(
      instance().markers[0].getElement().querySelector("svg"),
    ).toBeInTheDocument();
  });

  it("leaves clusters as numbers", () => {
    // A number is what "several restaurants" means. A cuisine icon over a
    // group would claim they were all the same kind of place.
    show({
      places: [
        place(),
        place({ id: "2", latitude: 40.7102, longitude: -73.9602 }),
      ],
    });

    const marker = instance().markers[0].getElement();

    expect(marker.dataset.clusterCount).toBe("2");
    expect(marker.querySelector("svg")).toBeNull();
  });
});

describe("finding the restaurant somebody is pointing at", () => {
  /** Three restaurants close enough to be drawn as one "3" at this zoom. */
  const crowd = [
    place({ id: "a", name: "Dunkin'" }),
    place({ id: "b", name: "Busy Bee Cafe", latitude: 40.7102, longitude: -73.9602 }),
    place({ id: "c", name: "Los Marinillos", latitude: 40.7104, longitude: -73.9601 }),
  ];

  const revealed = (): HTMLElement | undefined =>
    instance()
      .markers.map((one) => one.getElement())
      .find((element) => element.dataset.reveal === "true");

  it("draws the restaurant on its own when a cluster is hiding it", () => {
    // The reported problem. Hovering "Busy Bee Cafe" highlighted a disc
    // reading "3", which tells the reader it is one of three somethings —
    // not where it is.
    show({ places: crowd, hoveredId: "b" });

    expect(revealed()).toBeDefined();
  });

  it("puts it at its own coordinates, not the group's centre", () => {
    // A centre is an average that may sit on none of its members, and the
    // promise being made is "it is right there".
    show({ places: crowd, hoveredId: "b" });

    const pin = instance().markers.find(
      (one) => one.getElement().dataset.reveal === "true",
    );

    expect(pin?.lngLat).toEqual([-73.9602, 40.7102]);
  });

  it("never changes the zoom to expose it", () => {
    // A preview that mutates the view is not a preview: a mouse travelling
    // down the list would rewrite the map the reader chose, and they would
    // come back to somewhere they never navigated to.
    show({ places: crowd, hoveredId: "b" });

    expect(instance().getZoom()).toBe(14);
  });

  it("takes the extra pin away when the pointer leaves", () => {
    const { rerender } = show({ places: crowd, hoveredId: "b" });

    expect(revealed()).toBeDefined();

    rerender(
      <MemoryRouter>
        <RestaurantMap places={crowd} centre={centre} hoveredId={null} />
      </MemoryRouter>,
    );

    expect(revealed()).toBeUndefined();
  });

  it("draws no second pin for a restaurant that already has its own", () => {
    // A cluster of one *is* the marker. Drawing it again on top of itself is
    // the same dot twice, and the emphasis is already carrying the answer.
    show({ places: [place({ id: "a" })], hoveredId: "a" });

    expect(revealed()).toBeUndefined();
    expect(instance().markers).toHaveLength(1);
  });

  it("names it where it actually is, not at the middle of the group", () => {
    // A cluster centre is an average that may sit on none of its members. A
    // name floating there says the restaurant is somewhere it is not.
    show({ places: crowd, hoveredId: "c" });

    const [popup] = instance().popups;

    expect(popup.content?.textContent).toBe("Los Marinillos");
    expect(popup.lngLat).toEqual([-73.9601, 40.7104]);
  });

  it("keeps the category glyph, so the pin still says what it is", () => {
    show({ places: crowd, hoveredId: "b" });

    expect(revealed()?.querySelector("svg")).toBeInTheDocument();
  });

  it("falls back to the chosen restaurant when nothing is hovered", () => {
    // Selection is persistent: it must not stop being answered because the
    // pointer moved off the row that made it.
    show({ places: crowd, selectedId: "b", hoveredId: null });

    expect(revealed()).toBeDefined();
  });
});

describe("how much the map moves while somebody reads the list", () => {
  it("stays exactly where it is for a place already on screen", () => {
    // The common case — the list and the map show the same ten results.
    const { rerender } = show({ places: [place()] });
    const before = instance().getCenter();

    rerender(
      <MemoryRouter>
        <RestaurantMap places={[place()]} centre={centre} hoveredId="1" />
      </MemoryRouter>,
    );

    expect(instance().getCenter()).toEqual(before);
  });

  it("pans to a place that is off screen", () => {
    const far = place({ id: "2", latitude: 41.5, longitude: -73.96 });

    show({ places: [place(), far], hoveredId: "2" });

    expect(instance().getCenter().lat).toBeCloseTo(41.5, 2);
  });

  it("pans without changing the zoom the reader chose", () => {
    const far = place({ id: "2", latitude: 41.5, longitude: -73.96 });

    show({ places: [place(), far], hoveredId: "2" });

    expect(instance().getZoom()).toBe(14);
  });

  it("never offers to search the area because of a hover", async () => {
    // The cost rule. A hover is not an ask, and a pan the page performed on
    // the reader's behalf must not look like the reader going looking.
    const onSearchArea = jest.fn();
    const far = place({ id: "2", latitude: 41.5, longitude: -73.96 });

    show({ places: [place(), far], hoveredId: "2", onSearchArea });

    expect(
      screen.queryByRole("button", { name: MAP_LABELS.searchThisArea }),
    ).not.toBeInTheDocument();
    expect(onSearchArea).not.toHaveBeenCalled();
  });
});

describe("the map answering back", () => {
  it("tells the page which row to light up when a pin is pointed at", async () => {
    const onHover = jest.fn();
    show({ onHover });

    await userEvent.hover(instance().markers[0].getElement());

    expect(onHover).toHaveBeenCalledWith("1");
  });

  it("stops previewing when the pointer leaves the pin", async () => {
    const onHover = jest.fn();
    show({ onHover });

    await userEvent.hover(instance().markers[0].getElement());
    await userEvent.unhover(instance().markers[0].getElement());

    expect(onHover).toHaveBeenLastCalledWith(null);
  });

  it("puts a selection down when the map itself is tapped", () => {
    // Clicking empty map space clears it. The pin handlers stop their own
    // clicks reaching here, so choosing one pin after another never clears
    // in the same tick it selects.
    const onSelect = jest.fn();
    show({ onSelect, selectedId: "1" });

    act(() => instance().emit("click"));

    expect(onSelect).toHaveBeenCalledWith(null);
  });
});

describe("the name beside the pin", () => {
  const crowd = [
    place({ id: "a", name: "Dunkin'" }),
    place({ id: "b", name: "Busy Bee Cafe", latitude: 40.7102, longitude: -73.9602 }),
  ];

  it("is placed at the restaurant's own coordinates", () => {
    // Not at a cluster centre, and not at a screen position we worked out
    // ourselves. Mapbox is handed a coordinate and does the rest.
    show({ places: [place({ id: "1", name: "UNICORN GLOW" })], hoveredId: "1" });

    const [popup] = instance().popups;

    expect(popup.content?.textContent).toBe("UNICORN GLOW");
    expect(popup.lngLat).toEqual([-73.96, 40.71]);
  });

  it("lets Mapbox choose the side it opens on", () => {
    // Withholding the anchor is the whole edge-collision behaviour: given
    // none, the library picks from the space left in the container, so a pin
    // against the right edge gets a label opening left and one against the
    // top gets a label below. Pinning an anchor here is what makes a label
    // clip at the boundary — at some container width, zoom or pixel ratio we
    // will never have looked at.
    show({ places: [place()], hoveredId: "1" });

    const [popup] = instance().popups;

    expect(popup.options.anchor).toBeUndefined();
    expect(popup.options.offset).toBeGreaterThan(0);
  });

  it("shows one label at a time while the pointer travels down the list", () => {
    // Moving Dunkin' -> Busy Bee Cafe updates one preview. A trail of names
    // left behind is worse than none.
    const { rerender } = show({ places: crowd, hoveredId: "a" });

    expect(instance().popups).toHaveLength(1);

    rerender(
      <MemoryRouter>
        <RestaurantMap places={crowd} centre={centre} hoveredId="b" />
      </MemoryRouter>,
    );

    expect(instance().popups).toHaveLength(1);
    expect(instance().popups[0].content?.textContent).toBe("Busy Bee Cafe");
  });

  it("goes when the pointer goes", () => {
    const { rerender } = show({ places: crowd, hoveredId: "a" });

    rerender(
      <MemoryRouter>
        <RestaurantMap places={crowd} centre={centre} hoveredId={null} />
      </MemoryRouter>,
    );

    expect(instance().popups).toHaveLength(0);
  });

  it("does not double up on the restaurant whose card is already open", () => {
    // The full card names it, gives the dish line and the way into the menu.
    // A second label saying only the name is clutter over the same pin.
    show({ places: crowd, selectedId: "a", hoveredId: "a" });

    expect(instance().popups).toHaveLength(0);
  });

  it("still labels a different restaurant while one is selected", () => {
    show({ places: crowd, selectedId: "a", hoveredId: "b" });

    expect(instance().popups).toHaveLength(1);
    expect(instance().popups[0].content?.textContent).toBe("Busy Bee Cafe");
  });

  it("takes the name as text, never as markup", () => {
    show({
      places: [place({ id: "1", name: "Bob <b>& Sons</b>" })],
      hoveredId: "1",
    });

    const [popup] = instance().popups;

    expect(popup.content?.textContent).toBe("Bob <b>& Sons</b>");
    expect(popup.content?.querySelector("b")).toBeNull();
  });
});

describe("when the container changes size", () => {
  /**
   * jsdom has no ResizeObserver, so the component's guard would skip it.
   *
   * The fake reports a size, because a real one always does and the component
   * now reads it: a callback carrying no entries was letting these tests pass
   * a resize that a browser would never send. Firing with the same size twice
   * has to be a no-op, which is the point of the guard.
   */
  const observers: ((width: number, height: number) => void)[] = [];

  beforeEach(() => {
    observers.length = 0;
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      constructor(
        private fire: (entries: { contentRect: DOMRectReadOnly }[]) => void,
      ) {
        observers.push((width, height) =>
          this.fire([{ contentRect: { width, height } as DOMRectReadOnly }]),
        );
      }
      observe() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    delete (window as unknown as { ResizeObserver?: unknown }).ResizeObserver;
  });

  it("tells the existing map about its new box", () => {
    // Mapbox measures the container once and sizes its canvas to what it
    // found. A CSS breakpoint, a pane becoming viewport-tall, devtools
    // opening - none of it reaches the map, so the canvas keeps the old
    // dimensions and the map draws into part of its box with dead space
    // around it.
    show();

    act(() => observers.forEach((fire) => fire(800, 600)));

    expect(instance().resizes).toBeGreaterThan(0);
  });

  it("ignores a callback that reports the same box", () => {
    // A ResizeObserver fires for sub-pixel churn as well as real changes, and
    // a WebGL canvas resized mid-scroll is a visible blink rather than a
    // no-op. This is what stopped the map flickering on a phone.
    show();

    act(() => observers.forEach((fire) => fire(800, 600)));

    const after = instance().resizes;

    act(() => observers.forEach((fire) => fire(800, 600)));
    act(() => observers.forEach((fire) => fire(800.4, 599.6)));

    expect(instance().resizes).toBe(after);
  });

  it("does not rebuild the map to fit a new box", () => {
    // Rebuilding would throw away the centre, the zoom, every marker and
    // whatever the reader had selected - while they are mid-scroll.
    show();

    const before = instance();

    act(() => observers.forEach((fire) => fire(800, 600)));

    expect(instance()).toBe(before);
    expect(before.removed).toBe(false);
  });
});
