import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import NearbyPage from "@/components/NearbyPage";
import { NEARBY_LABELS } from "@/customConstants/labels";
import { CoordinatesType } from "@/interfaces/location";

/**
 * The page somebody lands on from a cuisine tile.
 *
 * What is tested here is mostly the empty half. With no location this page
 * can show nothing at all, and the difference between "waiting on you" and
 * "broken" is entirely in what it says while it waits.
 */
const place: { location: CoordinatesType | null; source: string | null } = {
  location: null,
  source: null,
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

jest.mock("@/customHooks/useNearby", () => ({
  __esModule: true,
  useNearbyDiscovery: () => ({ discovery: null, loading: false }),
  useResolveLocation: () => ({ resolve: jest.fn(), loading: false }),
  useNearbyRestaurants: () => ({
    places: [],
    loading: false,
    unavailable: false,
  }),
  useRestaurantsInArea: () => ({ search: jest.fn(), loading: false }),
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
});

describe("NearbyPage without a location", () => {
  it("asks where to look", () => {
    show("/nearby");

    expect(screen.getByText(NEARBY_LABELS.needLocation)).toBeInTheDocument();
  });

  it("says why a cuisine page is empty rather than looking broken", () => {
    // The regression. "Chinese near you" over a bare pair of buttons reads
    // like a page whose results failed to load — the heading is already a
    // promise, and nothing on the page said it was waiting on the reader.
    show("/nearby?cuisine=chinese");

    expect(
      screen.getByText(NEARBY_LABELS.cuisineNearYou("Chinese")),
    ).toBeInTheDocument();
    expect(
      screen.getByText(NEARBY_LABELS.needLocationHelp),
    ).toBeInTheDocument();
  });

  it("does not repeat itself when there is no cuisine", () => {
    // "Choose where to look" and "tell us where to look" one under the other
    // is the same sentence twice.
    show("/nearby");

    expect(
      screen.queryByText(NEARBY_LABELS.needLocationHelp),
    ).not.toBeInTheDocument();
  });

  it("offers both ways to answer", () => {
    show("/nearby?cuisine=chinese");

    expect(
      screen.getByRole("button", { name: /use my current location/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enter a location/i }),
    ).toBeInTheDocument();
  });
});

describe("NearbyPage with a location", () => {
  beforeEach(() => {
    place.location = { latitude: 40.7686, longitude: -73.8228 };
    place.source = "chosen";
  });

  it("says plainly when there is nothing nearby", () => {
    // Which is the honest answer for a catalogue that does not cover
    // somewhere yet, and must not be dressed up as a loading state.
    show("/nearby?cuisine=chinese");

    expect(screen.getByText(NEARBY_LABELS.empty)).toBeInTheDocument();
    expect(screen.getByText(NEARBY_LABELS.emptyHelp)).toBeInTheDocument();
  });

  it("counts what it found", () => {
    show("/nearby");

    expect(screen.getByText(NEARBY_LABELS.results(0))).toBeInTheDocument();
  });
});
