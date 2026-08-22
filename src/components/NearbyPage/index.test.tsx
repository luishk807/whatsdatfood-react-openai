import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "fs";
import { join } from "path";
import { MockedProvider } from "@apollo/client/testing";
import NearbyPage from "@/components/NearbyPage";
import { LOCATION_LABELS, NEARBY_LABELS } from "@/customConstants/labels";
import { CoordinatesType, NearbyPlaceType } from "@/interfaces/location";
import mapboxgl from "@/test/mapboxMock";

/**
 * The page a cuisine tile lands on.
 *
 * What is asserted here is mostly about restraint. Opening it costs one query
 * over ten rows; switching to the map costs none; every further batch is a
 * tap. The page used to spend forty rows on arrival and then throw most of
 * them away, and somebody we could not place saw two buttons where the food
 * should have been.
 */
const place: {
  location: (CoordinatesType & { label?: string }) | null;
  source: string | null;
} = { location: null, source: null };

const row = (id: string): NearbyPlaceType => ({
  id,
  slug: `place-${id}`,
  name: `Restaurant ${id}`,
  distance_km: 0.4,
  latitude: 40.71,
  longitude: -73.96,
});

const nearby = {
  places: [] as NearbyPlaceType[],
  loading: false,
  loadingMore: false,
  hasMore: false,
  showMore: jest.fn(),
  unavailable: false,
};

const area = {
  places: null as NearbyPlaceType[] | null,
  search: jest.fn(),
  showMore: jest.fn(),
  clear: jest.fn(),
  loading: false,
  hasMore: false,
};

jest.mock("@/customHooks/useDiscoveryLocation", () => ({
  __esModule: true,
  default: () => ({
    ...place,
    status: "idle",
    request: jest.fn(),
    choose: jest.fn(),
    forget: jest.fn(),
    nameArea: jest.fn(),
  }),
}));

/** Records what the page asked for, so "no extra request" is assertable. */
const useNearbyRestaurants = jest.fn((..._args: unknown[]) => nearby);
const useRestaurantsInArea = jest.fn((..._args: unknown[]) => area);

jest.mock("@/customHooks/useNearby", () => ({
  __esModule: true,
  useNearbyDiscovery: () => ({ discovery: null, loading: false }),
  useResolveLocation: () => ({ resolve: jest.fn(), loading: false }),
  useNearbyRestaurants: (...args: unknown[]) =>
    (useNearbyRestaurants as jest.Mock)(...args),
  useRestaurantsInArea: (...args: unknown[]) =>
    (useRestaurantsInArea as jest.Mock)(...args),
}));

/** The Map button only exists where a token does. */
jest.mock("@/customConstants/map", () => ({
  ...jest.requireActual("@/customConstants/map"),
  mapConfigured: () => true,
}));

const show = (path: string) =>
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <MemoryRouter initialEntries={[path]}>
        <NearbyPage />
      </MemoryRouter>
    </MockedProvider>,
  );

beforeEach(() => {
  place.location = null;
  place.source = null;
  nearby.places = [];
  nearby.loading = false;
  nearby.loadingMore = false;
  nearby.hasMore = false;
  nearby.unavailable = false;
  nearby.showMore.mockReset();
  area.places = null;
  area.loading = false;
  area.hasMore = false;
  area.search.mockReset();
  area.showMore.mockReset();
  area.clear.mockReset();
  useNearbyRestaurants.mockClear();
  useRestaurantsInArea.mockClear();
});

describe("landing here from a cuisine tile", () => {
  beforeEach(() => {
    place.location = { latitude: 40.7686, longitude: -73.8228, label: "Flushing" };
    place.source = "chosen";
    nearby.places = [row("1"), row("2")];
  });

  it("shows results immediately when we already know where to look", () => {
    // The whole point of the change. A location chosen weeks ago, or a
    // browser permission still standing, is an answer — asking for it again
    // is friction with nothing on the other side.
    show("/nearby?cuisine=italian");

    expect(
      screen.getByText(NEARBY_LABELS.cuisineNear("Italian", "Flushing")),
    ).toBeInTheDocument();
    expect(screen.getByText("Restaurant 1")).toBeInTheDocument();
  });

  it("does not put a location page in front of the food", () => {
    show("/nearby?cuisine=italian");

    expect(
      screen.queryByText(NEARBY_LABELS.needLocationHelp),
    ).not.toBeInTheDocument();
  });

  it("passes the cuisine to the server rather than filtering afterwards", () => {
    // Filtering ten rows down to whichever happened to be Italian is how this
    // page used to return nothing on a perfectly good query.
    show("/nearby?cuisine=italian");

    expect(useNearbyRestaurants).toHaveBeenCalledWith(place.location, "italian");
  });

  it("offers a way to change where it is looking", async () => {
    show("/nearby?cuisine=italian");

    await userEvent.click(
      screen.getByRole("button", { name: LOCATION_LABELS.change }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("when we cannot place somebody", () => {
  it("asks in a sheet over the results rather than instead of them", async () => {
    show("/nearby?cuisine=italian");

    // The heading is still the promise the tile made.
    expect(
      screen.getByText(NEARBY_LABELS.cuisineNearYou("Italian")),
    ).toBeInTheDocument();

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });

  it("offers both ways to answer", async () => {
    show("/nearby");

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    expect(
      screen.getByRole("button", { name: /use my current location/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enter a location/i }),
    ).toBeInTheDocument();
  });

  it("says what a location is for", async () => {
    // And what it is not for. Selecting a neighbourhood must not read as
    // publishing where somebody is.
    show("/nearby");

    await waitFor(() =>
      expect(screen.getByText(LOCATION_LABELS.privacyNote)).toBeInTheDocument(),
    );
  });
});

describe("one batch at a time", () => {
  beforeEach(() => {
    place.location = { latitude: 40.7686, longitude: -73.8228, label: "Flushing" };
    place.source = "chosen";
  });

  it("offers more only when there is more", () => {
    nearby.places = [row("1")];
    nearby.hasMore = false;
    show("/nearby");

    expect(
      screen.queryByRole("button", { name: NEARBY_LABELS.showMore }),
    ).not.toBeInTheDocument();
  });

  it("loads the next batch when asked, and not before", async () => {
    nearby.places = [row("1"), row("2")];
    nearby.hasMore = true;
    show("/nearby");

    expect(nearby.showMore).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: NEARBY_LABELS.showMore }),
    );

    expect(nearby.showMore).toHaveBeenCalledTimes(1);
  });

  it("says it is working rather than going quiet", async () => {
    nearby.places = [row("1")];
    nearby.hasMore = true;
    nearby.loadingMore = true;
    show("/nearby");

    expect(
      screen.getByRole("button", { name: NEARBY_LABELS.loadingMore }),
    ).toBeDisabled();
  });

  it("counts what it is showing", () => {
    nearby.places = [row("1"), row("2")];
    show("/nearby");

    expect(screen.getByText(NEARBY_LABELS.results(2))).toBeInTheDocument();
  });

  it("says plainly when there is nothing nearby", () => {
    // The honest answer for a catalogue that does not cover somewhere yet,
    // and it must not be dressed up as a loading state.
    show("/nearby");

    expect(screen.getByText(NEARBY_LABELS.empty)).toBeInTheDocument();
  });

  it("blames the filter rather than the neighbourhood", () => {
    // This test used to load `?cuisine=chinese` and assert the *unfiltered*
    // sentence, which is the bug written down: "Coffee near you" showed "No
    // restaurants around here yet" while five coffee shops stood four hundred
    // metres away. The area was never the problem.
    show("/nearby?cuisine=chinese");

    expect(
      screen.getByText(NEARBY_LABELS.emptyFiltered("Chinese")),
    ).toBeInTheDocument();
    expect(screen.queryByText(NEARBY_LABELS.empty)).not.toBeInTheDocument();
  });

  it("offers one tap out of a filter that found nothing", () => {
    // Without this the reader's only move is the browser back button, and the
    // page they came from is the one that sent them here.
    show("/nearby?cuisine=chinese");

    expect(
      screen.getByRole("link", { name: NEARBY_LABELS.showEverything }),
    ).toHaveAttribute("href", "/nearby");
  });
});

describe("the list and the map are the same ten restaurants", () => {
  beforeEach(() => {
    place.location = { latitude: 40.7686, longitude: -73.8228, label: "Flushing" };
    place.source = "chosen";
    nearby.places = [row("1"), row("2")];
  });

  it("switches view without asking for anything", async () => {
    show("/nearby");

    const before = useNearbyRestaurants.mock.calls.length;

    await userEvent.click(screen.getByRole("button", { name: /map/i }));

    // Re-rendering calls the hook again; what matters is that it is called
    // with the same arguments, so Apollo answers from cache and no request
    // leaves the browser.
    expect(
      useNearbyRestaurants.mock.calls.slice(before).every(
        ([point, cuisine]) => point === place.location && cuisine === undefined,
      ),
    ).toBe(true);
    expect(area.search).not.toHaveBeenCalled();
  });

  it("remembers which half is showing", async () => {
    show("/nearby");

    await userEvent.click(screen.getByRole("button", { name: /map/i }));

    expect(screen.getByRole("button", { name: /map/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("offers no map at all without a token", () => {
    // The list is the half that always works, so losing the map costs a
    // reader nothing they cannot get another way.
    jest.isolateModules(() => {
      jest.doMock("@/customConstants/map", () => ({
        ...jest.requireActual("@/customConstants/map"),
        mapConfigured: () => false,
      }));
    });

    show("/nearby");

    expect(screen.getByRole("button", { name: /list/i })).toBeInTheDocument();
  });
});

describe("results the reader panned to", () => {
  beforeEach(() => {
    place.location = { latitude: 40.7686, longitude: -73.8228, label: "Flushing" };
    place.source = "chosen";
    nearby.places = [row("1")];
    area.places = [row("9"), row("10")];
  });

  it("shows what was found in the area rather than the standing list", () => {
    show("/nearby");

    expect(screen.getByText("Restaurant 9")).toBeInTheDocument();
    expect(screen.queryByText("Restaurant 1")).not.toBeInTheDocument();
  });

  it("offers more in that area, not more nearby", async () => {
    area.hasMore = true;
    show("/nearby");

    await userEvent.click(
      screen.getByRole("button", { name: NEARBY_LABELS.showMoreArea }),
    );

    expect(area.showMore).toHaveBeenCalledTimes(1);
    expect(nearby.showMore).not.toHaveBeenCalled();
  });

  it("passes the cuisine to the area search too", () => {
    show("/nearby?cuisine=italian");

    expect(useRestaurantsInArea).toHaveBeenCalledWith("italian");
  });
});

describe("when the query fails", () => {
  it("says the search is unavailable rather than that there is nothing here", () => {
    // The frontend deploys ahead of the API routinely. "Nothing near you" is
    // a claim; "we could not ask" is the truth.
    place.location = { latitude: 40.7686, longitude: -73.8228, label: "Flushing" };
    nearby.unavailable = true;
    show("/nearby");

    expect(screen.getByText(NEARBY_LABELS.unavailable)).toBeInTheDocument();
  });
});

describe("the active category", () => {
  beforeEach(() => {
    place.location = { latitude: 40.7686, longitude: -73.8228, label: "Flushing" };
    place.source = "chosen";
    nearby.places = [row("1")];
  });

  it("is visible, because a filter you cannot see is one you cannot undo", () => {
    // The reader arrives here already filtered, from a shortcut on the front
    // door. Nothing else on the page says which category is on.
    show("/nearby?cuisine=italian");

    expect(
      screen.getByRole("link", { name: /Clear the Italian filter/i }),
    ).toBeInTheDocument();
  });

  it("clears back to everything nearby", () => {
    show("/nearby?cuisine=italian");

    expect(
      screen.getByRole("link", { name: /Clear the Italian filter/i }),
    ).toHaveAttribute("href", "/nearby");
  });

  it("keeps the map when the filter is cleared on the map", () => {
    // Clearing a category should not also throw away the view somebody chose.
    show("/nearby?cuisine=italian&view=map");

    expect(
      screen.getByRole("link", { name: /Clear the Italian filter/i }),
    ).toHaveAttribute("href", "/nearby?view=map");
  });

  it("shows no chip when nothing is filtered", () => {
    show("/nearby");

    expect(screen.queryByRole("link", { name: /Clear the/i })).not.toBeInTheDocument();
  });
});

describe("the list and the map as one interface", () => {
  beforeEach(() => {
    place.location = { latitude: 40.71, longitude: -73.96, label: "Flushing" };
    place.source = "device";
    nearby.places = [row("1"), row("2")];
  });

  it("does not treat pointing at a row as choosing it", async () => {
    // Hover *was* selection, which is why choosing a restaurant and then
    // reading down the list discarded the choice on the very next row.
    show("/nearby");

    const first = await screen.findByRole("link", { name: /restaurant 1/i });

    await userEvent.hover(first);

    expect(first).not.toHaveAttribute("aria-current");
  });

  it("keeps a pin's choice while the pointer moves down the list", async () => {
    // The two halves are one interface: a pin chooses, and pointing at rows
    // afterwards previews without throwing that choice away.
    show("/nearby?view=map");

    const first = await screen.findByRole("link", { name: /restaurant 1/i });
    const map = await waitFor(() => {
      const built = mapboxgl.lastMap();

      if (!built) {
        throw new Error("no map yet");
      }

      return built;
    });

    // Both restaurants sit at the same coordinates in this fixture, so they
    // are drawn as one cluster — which is exactly the case that used to
    // leave the reader unable to tell where either of them was.
    await userEvent.click(map.markers[0].getElement());
    await userEvent.hover(first);

    expect(screen.getByRole("link", { name: /restaurant 2/i })).toBeInTheDocument();
    expect(area.search).not.toHaveBeenCalled();
  });

  it("shows the map beside the results rather than above them", async () => {
    // Stacked, the relationship broke the moment the reader scrolled: the
    // map went up past the top of the window, and hovering a result became a
    // change to something nobody could see.
    show("/nearby?view=map");

    await waitFor(() =>
      expect(screen.getByRole("link", { name: /restaurant 1/i })).toBeInTheDocument(),
    );

    // Both halves are on the page at once, and the list is not replaced.
    expect(screen.getByRole("link", { name: /restaurant 2/i })).toBeInTheDocument();
  });

  it("spends no query on pointing at a restaurant", async () => {
    // Hover is client-side map state over rows already in hand. If this ever
    // fails, reading the list has grown a bill.
    show("/nearby?view=map");

    const first = await screen.findByRole("link", { name: /restaurant 1/i });
    const calls = useNearbyRestaurants.mock.calls.length;

    await userEvent.hover(first);
    await userEvent.unhover(first);

    // Nothing was searched, and the hook was never asked a different
    // question — so Apollo answers from the same cache entry it already had.
    expect(area.search).not.toHaveBeenCalled();
    expect(useNearbyRestaurants).toHaveBeenLastCalledWith(
      ...useNearbyRestaurants.mock.calls[calls - 1],
    );
  });
});

describe("keeping the map in view on a phone", () => {
  /**
   * Scrolling the results carried the whole page, so the map left the screen
   * and every selection after that pointed at somewhere the reader could no
   * longer see. The map is the geographic context for the list underneath it;
   * losing it makes the list a directory again.
   */
  beforeEach(() => {
    place.location = { latitude: 40.7686, longitude: -73.8228, label: "Flushing" };
    place.source = "chosen";
    nearby.places = [row("1"), row("2")];
  });

  /**
   * The map's own panel, not the workspace around it.
   *
   * Both are sticky now — the workspace pins the whole split below the header
   * at `lg`, the panel pins the map above the list on a phone — so "the first
   * element with sticky in its class" stopped meaning anything. The panel is
   * the one pinned at every width, so its `top-` carries no breakpoint
   * prefix.
   *
   * Layout is the one thing jsdom cannot actually exercise: it applies no
   * Tailwind and lays nothing out. These assertions are deliberately few and
   * they check the two facts that have broken before — what the map is
   * pinned against, and what it is measured in.
   */
  const mapPanel = (container: HTMLElement) =>
    [...container.querySelectorAll<HTMLElement>("[class*='sticky']")].find(
      (element) => /(^|\s)top-\[/.test(element.className),
    ) ?? null;

  it("pins the map so the results scroll underneath it", async () => {
    const { container } = show("/nearby?view=map");

    await screen.findByRole("link", { name: /restaurant 1/i });

    expect(mapPanel(container)).not.toBeNull();
  });

  it("pins it against the header's own height rather than a copy of it", async () => {
    // The header height was written three times in three numbers — `h-14` on
    // the header, `top-14` here, `scroll-mt-16` on the menu. Anything pinned
    // below the bar was guessing at how tall it is, and a guess made against
    // a desktop window is still a guess when it renders on a phone. One
    // token, and it includes the bar's 1px border: offset by the bar alone,
    // sticky content sits a hair high and shows a sliver of whatever is
    // scrolling behind it.
    const { container } = show("/nearby?view=map");

    await screen.findByRole("link", { name: /restaurant 1/i });

    expect(mapPanel(container)?.className).toContain("top-[var(--offset-header)]");
  });

  it("is not pinned from the moment the page loads", async () => {
    // The heading, the filters and the location scroll away normally first.
    // A map fixed on arrival would make the controls above it unreachable.
    const { container } = show("/nearby?view=map");

    await screen.findByRole("link", { name: /restaurant 1/i });

    expect(mapPanel(container)?.className).not.toMatch(/fixed/);
  });

  it("takes its phone height from the shared token", async () => {
    // One height class on the element, so the breakpoint that overrides it
    // actually can. Written as an `@supports` *variant* instead, Tailwind
    // emits that block after every breakpoint rule in the layer - same
    // specificity, later rule, no media query - so `height: 42dvh` won at
    // `lg` too, where the map is supposed to fill its column, and left a
    // blank half-screen underneath it.
    const { container } = show("/nearby?view=map");

    await screen.findByRole("link", { name: /restaurant 1/i });

    const className = mapPanel(container)?.className ?? "";

    expect(className).toContain("h-[var(--height-map-phone)]");
    expect(className).not.toMatch(/@supports/);
  });

  it("fills its column once the split takes over", async () => {
    // The reported blank area: the map drew into the top of a
    // viewport-height workspace and left the rest empty.
    const { container } = show("/nearby?view=map");

    await screen.findByRole("link", { name: /restaurant 1/i });

    expect(mapPanel(container)?.className).toContain("lg:h-full");
  });

  it("stops being pinned to the top once the split takes over", async () => {
    // At `lg` the map is a column of its own inside a workspace that is
    // itself pinned. Two things pinning the same element fight each other.
    const { container } = show("/nearby?view=map");

    await screen.findByRole("link", { name: /restaurant 1/i });

    expect(mapPanel(container)?.className).toContain("lg:static");
  });
});

describe("who owns the scroll in the workspace", () => {
  beforeEach(() => {
    place.location = { latitude: 40.71, longitude: -73.96, label: "Flushing" };
    place.source = "chosen";
    nearby.places = [row("1"), row("2")];
    nearby.hasMore = true;
  });

  const resultsPane = (container: HTMLElement) =>
    container.querySelector<HTMLElement>(".results-scroll");

  it("gives the results their own scroller rather than the page", async () => {
    // The whole page used to scroll, so reading past the sixth restaurant
    // carried the map off the top of the window - and the map is the entire
    // reason for this view.
    const { container } = show("/nearby?view=map");

    await screen.findByRole("link", { name: /restaurant 1/i });

    expect(resultsPane(container)?.className).toContain("lg:overflow-y-auto");
  });

  it("lets the scroll out at the edges rather than trapping it", async () => {
    // `overscroll-contain` refuses to hand the scroll onward at all, so a
    // reader who had run out of restaurants could not reach the footer
    // without moving the pointer off the list first. Chaining *is* the
    // handoff: the pane moves while it has room, the page takes over at the
    // top and bottom edges.
    const { container } = show("/nearby?view=map");

    await screen.findByRole("link", { name: /restaurant 1/i });

    expect(resultsPane(container)?.className).not.toMatch(/overscroll-contain/);
  });

  it("can shrink below its contents, which is what makes it scroll", async () => {
    // A grid item defaults to `min-height: auto` and refuses to shrink below
    // its content, so without this the pane grows to fit every restaurant,
    // never overflows, never scrolls, and the document scrolls instead.
    const { container } = show("/nearby?view=map");

    await screen.findByRole("link", { name: /restaurant 1/i });

    expect(resultsPane(container)?.className).toContain("lg:min-h-0");
  });

  it("keeps show-more inside the list it belongs to", async () => {
    // Outside the scroller it would sit under the map, unreachable by
    // scrolling the list it loads more of.
    const { container } = show("/nearby?view=map");

    await screen.findByRole("link", { name: /restaurant 1/i });

    const more = screen.getByRole("button", { name: NEARBY_LABELS.showMore });

    expect(resultsPane(container)?.contains(more)).toBe(true);
  });
});

describe("the phone map height still falls back", () => {
  // The guarantee moved out of the component and into the stylesheet, so
  // this is where it has to be checked. `dvh` tracks Safari's toolbar
  // sliding in and out; `vh` does not, so a map sized only in `vh` is cut
  // off exactly when the toolbar returns - and a browser without `dvh` needs
  // something to fall back to.
  const css = readFileSync(
    join(__dirname, "..", "..", "index.css"),
    "utf8",
  );

  it("defines the token in vh first", () => {
    expect(css).toMatch(/--height-map-phone:\s*42vh/);
  });

  it("upgrades it to dvh where that is supported", () => {
    expect(css).toMatch(/@supports \(height: 1dvh\)/);
    expect(css).toMatch(/--height-map-phone:\s*42dvh/);
  });
});
