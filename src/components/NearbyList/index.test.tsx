import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NearbyList from "@/components/NearbyList";
import { NEARBY_LABELS } from "@/customConstants/labels";
import { NearbyPlaceType } from "@/interfaces/location";

const place = (overrides: Partial<NearbyPlaceType> = {}): NearbyPlaceType => ({
  id: "1",
  slug: "shanghai-you-garden",
  name: "Shanghai You Garden",
  neighborhood: "Flushing",
  price_range: "$$",
  distance_km: 0.64,
  top_dish_name: "Soup Dumplings",
  top_dish_photo_url: "https://media.test/dumplings.jpg",
  ...overrides,
});

const show = (places: NearbyPlaceType[], props = {}) =>
  render(
    <MemoryRouter>
      <NearbyList places={places} {...props} />
    </MemoryRouter>,
  );

describe("NearbyList", () => {
  it("leads with the dish somebody photographed", () => {
    show([place()]);

    expect(screen.getByText("Soup Dumplings")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shanghai you garden/i })).toHaveAttribute(
      "href",
      "/menu-results/shanghai-you-garden",
    );
  });

  it("says how far, in miles, and where", () => {
    show([place()]);

    expect(screen.getByText(/0\.4 mi · Flushing · \$\$/)).toBeInTheDocument();
  });

  it("lists a restaurant nobody has photographed rather than hiding it", () => {
    // It is a real place a short walk away, and the empty tile is the ask.
    // Hiding it makes the product look emptier than the neighbourhood is.
    show([
      place({
        id: "2",
        name: "Golden Mall",
        top_dish_name: null,
        top_dish_photo_url: null,
      }),
    ]);

    expect(screen.getByText("Golden Mall")).toBeInTheDocument();
    expect(screen.getByText(NEARBY_LABELS.noPhotos)).toBeInTheDocument();
    expect(screen.getByText(NEARBY_LABELS.addFirst)).toBeInTheDocument();
  });

  it("shows no photograph at all rather than a stock one", () => {
    const { container } = show([
      place({ top_dish_name: null, top_dish_photo_url: null }),
    ]);

    expect(container.querySelector("img")).toBeNull();
  });

  it("says so when there is nothing around", () => {
    show([]);

    expect(screen.getByText(NEARBY_LABELS.empty)).toBeInTheDocument();
    expect(screen.getByText(NEARBY_LABELS.emptyHelp)).toBeInTheDocument();
  });

  it("marks the row the map has selected", () => {
    // The pin and the row are the same thing seen twice, and colour alone
    // must not be what says which one is active.
    show([place(), place({ id: "2", name: "Golden Mall" })], {
      selectedId: "2",
    });

    expect(
      screen.getByRole("link", { name: /golden mall/i }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("shows placeholders while it is still asking", () => {
    const { container } = show([], { loading: true });

    expect(container.querySelectorAll("li").length).toBeGreaterThan(0);
  });
});
