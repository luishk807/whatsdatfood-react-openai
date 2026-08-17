import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Homepage from "@/components/Homepage";
import { SEARCH_LABELS, SHOWCASE_LABELS } from "@/customConstants/labels";

jest.mock("@/customHooks/useRestaurantMutations", () => ({
  __esModule: true,
  default: () => ({ getRestaurantListByName: jest.fn().mockResolvedValue([]) }),
}));

const wall = { photos: [] as unknown[], loading: false };

jest.mock("@/customHooks/useRecentDishPhotos", () => ({
  __esModule: true,
  default: () => wall,
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
});
