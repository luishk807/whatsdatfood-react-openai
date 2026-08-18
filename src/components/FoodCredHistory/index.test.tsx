import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FoodCredHistory from "@/components/FoodCredHistory";
import { FoodCredEventItemType } from "@/interfaces/reputation";

const event = (
  overrides: Partial<FoodCredEventItemType> = {},
): FoodCredEventItemType => ({
  id: "1",
  event_type: "PHOTO_APPROVED",
  points: 10,
  label: "Photo",
  dish_name: "Short rib",
  restaurant_name: "Chun Hong Kong Cafe",
  restaurant_slug: "chun-hong-kong-cafe",
  photo_url: "https://example.test/photo.jpg",
  reversed: false,
  createdAt: "2026-08-01T12:00:00Z",
  ...overrides,
});

const show = (events: FoodCredEventItemType[], loading = false) =>
  render(
    <MemoryRouter>
      <FoodCredHistory events={events} loading={loading} />
    </MemoryRouter>,
  );

describe("FoodCredHistory", () => {
  it("says what each entry was for and what it was worth", () => {
    show([event()]);

    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("+10")).toBeInTheDocument();
    expect(
      screen.getByText("Short rib · Chun Hong Kong Cafe"),
    ).toBeInTheDocument();
  });

  it("links an entry back to the restaurant it came from", () => {
    show([event()]);

    expect(
      screen.getByRole("link", { name: "Short rib · Chun Hong Kong Cafe" }),
    ).toHaveAttribute("href", "/menu-results/chun-hong-kong-cafe");
  });

  it("keeps a reversed entry visible", () => {
    // A total that drops without an explanation is how you lose the person who
    // was contributing.
    show([
      event({ id: "2", reversed: true, points: -10, label: "Photo" }),
    ]);

    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("-10")).toBeInTheDocument();
  });

  it("asks for a photo when there is nothing yet", () => {
    show([]);

    expect(
      screen.getByText(
        "Nothing yet. Add a photo of a dish and you are on the board.",
      ),
    ).toBeInTheDocument();
  });

  it("does not claim an empty history while it is still loading", () => {
    show([], true);

    expect(screen.queryByText(/Nothing yet/)).toBeNull();
  });
});
