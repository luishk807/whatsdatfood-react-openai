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
