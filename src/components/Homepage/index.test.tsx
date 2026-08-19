import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Homepage from "@/components/Homepage";
import {
  CUISINE_LABELS,
  SEARCH_LABELS,
  SHOWCASE_LABELS,
} from "@/customConstants/labels";

jest.mock("@/customHooks/useRestaurantMutations", () => ({
  __esModule: true,
  default: () => ({ getRestaurantListByName: jest.fn().mockResolvedValue([]) }),
}));

const wall = { photos: [] as unknown[], loading: false };

jest.mock("@/customHooks/useRecentDishPhotos", () => ({
  __esModule: true,
  default: () => wall,
}));

const cuisines = { tiles: [] as unknown[], loading: false };

jest.mock("@/customHooks/useCuisineTiles", () => ({
  __esModule: true,
  default: () => cuisines,
}));

/**
 * The location sections. Signed out and un-located is the front door most
 * visitors see, so it is the default here; the sections have their own tests.
 */
const place = {
  location: null as unknown,
  source: null,
  status: "idle",
  request: jest.fn(),
  choose: jest.fn(),
  forget: jest.fn(),
  nameArea: jest.fn(),
};

jest.mock("@/customHooks/useDiscoveryLocation", () => ({
  __esModule: true,
  default: () => place,
}));

const discovery = { discovery: null as unknown, loading: false, unavailable: false };

jest.mock("@/customHooks/useNearby", () => ({
  __esModule: true,
  useNearbyDiscovery: () => discovery,
  useResolveLocation: () => ({ resolve: jest.fn(), loading: false }),
  useNearbyRestaurants: () => ({ places: [], loading: false, unavailable: false }),
  useRestaurantsInArea: () => ({ search: jest.fn(), loading: false }),
}));

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ user: null }),
}));

jest.mock("@/customHooks/useFoodCred", () => ({
  __esModule: true,
  default: () => ({
    stats: null,
    statsLoading: false,
    events: [],
    historyLoading: false,
    unavailable: true,
  }),
}));

const show = () =>
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

describe("Homepage", () => {
  beforeEach(() => {
    wall.photos = [];
    wall.loading = false;
    cuisines.tiles = [];
    cuisines.loading = false;
    place.location = null;
    place.status = "idle";
    discovery.discovery = null;
    discovery.loading = false;
  });

  it("says what the product does, not what to type", () => {
    show();

    // It read "Find your favorite menu", which describes a search box rather
    // than the reason to use this.
    expect(
      screen.getByRole("heading", { name: SEARCH_LABELS.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(SEARCH_LABELS.subtitle)).toBeInTheDocument();
  });

  it("puts the search where someone lands", async () => {
    show();

    expect(await screen.findByRole("searchbox")).toBeInTheDocument();
  });

  it("loads the search lazily but shows something while it arrives", () => {
    const { container } = show();

    // The heading must not wait on a chunk; the front door is the page most
    // often loaded and most often left.
    expect(
      screen.getByRole("heading", { level: 1, name: SEARCH_LABELS.title }),
    ).toBeInTheDocument();
    expect(container.firstChild).not.toBeNull();
  });

  it("shows the food under the search once there is any", () => {
    wall.photos = [
      {
        id: "1",
        url_s: "https://example.test/anago.jpg",
        dish_name: "Anago",
        restaurant_name: "Sushi Noz",
        restaurant_slug: "sushi-noz",
      },
    ];

    show();

    expect(screen.getByText("Anago")).toBeInTheDocument();
  });

  it("still renders the search when there are no photos", () => {
    // The wall is an invitation, not the product. Someone landing on a fresh
    // deployment with nothing uploaded must still be able to look a place up.
    show();

    expect(
      screen.getByRole("heading", { level: 1, name: SEARCH_LABELS.title }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: SHOWCASE_LABELS.heading }),
    ).not.toBeInTheDocument();
  });

  it("offers generic inspiration only below the real photographs", () => {
    // Diner photos are the product; stock imagery is what fills the page when
    // there are none yet. It must never lead.
    wall.photos = [{ id: "1", url_m: "https://example.test/a.jpg", dish: "Ramen" }];
    cuisines.tiles = [
      {
        category: "japanese",
        label: "Japanese",
        url: "https://images.unsplash.test/a.jpg",
        thumb_url: null,
        alt: null,
        photographer: "Zhe ZHANG",
        photographer_url: "https://unsplash.test/@z",
        provider_url: "https://unsplash.test/",
        provider: "unsplash",
      },
    ];

    const { container } = show();
    const text = container.textContent ?? "";

    expect(text.indexOf(SHOWCASE_LABELS.heading)).toBeLessThan(
      text.indexOf(CUISINE_LABELS.title),
    );
  });

  it("labels stock imagery as such so nobody mistakes it for a restaurant", () => {
    cuisines.tiles = [
      {
        category: "thai",
        label: "Thai",
        url: "https://images.unsplash.test/b.jpg",
        thumb_url: null,
        alt: null,
        photographer: "A N",
        photographer_url: "https://unsplash.test/@a",
        provider_url: "https://unsplash.test/",
        provider: "unsplash",
      },
    ];

    show();

    expect(screen.getByText(CUISINE_LABELS.disclosure)).toBeInTheDocument();
  });
});
