import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import NearbyPage from "@/components/NearbyPage";
import { LOCATION_LABELS, NEARBY_LABELS } from "@/customConstants/labels";
import { CoordinatesType, NearbyPlaceType } from "@/interfaces/location";

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
    show("/nearby?cuisine=chinese");

    expect(screen.getByText(NEARBY_LABELS.empty)).toBeInTheDocument();
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
