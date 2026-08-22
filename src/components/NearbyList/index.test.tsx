import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("pointing at a row", () => {
  const two = [place(), place({ id: "2", name: "Golden Mall", slug: "golden-mall" })];

  it("previews the restaurant under the pointer", async () => {
    const onHover = jest.fn();
    show(two, { onHover });

    await userEvent.hover(screen.getByRole("link", { name: /golden mall/i }));

    expect(onHover).toHaveBeenCalledWith("2");
  });

  it("stops previewing when the pointer leaves", async () => {
    const onHover = jest.fn();
    show(two, { onHover });

    const row = screen.getByRole("link", { name: /golden mall/i });

    await userEvent.hover(row);
    await userEvent.unhover(row);

    expect(onHover).toHaveBeenLastCalledWith(null);
  });

  it("previews on keyboard focus exactly as it does on hover", async () => {
    // The map is the half no keyboard reaches. If pointing were the only way
    // to ask "where is this one", the answer would be unavailable to anybody
    // using one.
    const onHover = jest.fn();
    show(two, { onHover });

    await userEvent.tab();

    expect(onHover).toHaveBeenCalledWith("1");
  });

  it("does not treat being pointed at as having been chosen", async () => {
    // Hover *was* selection, which is why tapping a pin and then reading
    // down the list threw the choice away on the very next row.
    const onSelect = jest.fn();
    show(two, { onSelect });

    await userEvent.hover(screen.getByRole("link", { name: /golden mall/i }));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("marks the pointed-at row differently from the chosen one", () => {
    show(two, { selectedId: "1", hoveredId: "2" });

    expect(
      screen.getByRole("link", { name: /shanghai you garden/i }),
    ).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: /golden mall/i })).not.toHaveAttribute(
      "aria-current",
    );
  });
});

describe("bringing a row into view for the map", () => {
  const two = [place(), place({ id: "2", name: "Golden Mall", slug: "golden-mall" })];

  it("scrolls the row a pin selected into view", () => {
    const scrollIntoView = jest.fn();

    Element.prototype.scrollIntoView = scrollIntoView;
    show(two, { scrollToId: "2" });

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: "nearest" }),
    );
  });

  it("scrolls nothing when the choice came from the list itself", () => {
    // A row that scrolls itself under a pointer travelling down it is a list
    // fighting its reader — the same trap the category bar hit, where
    // scrollIntoView cancelled the jump the reader had just asked for.
    const scrollIntoView = jest.fn();

    Element.prototype.scrollIntoView = scrollIntoView;
    show(two, { selectedId: "2", hoveredId: "2", scrollToId: null });

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
