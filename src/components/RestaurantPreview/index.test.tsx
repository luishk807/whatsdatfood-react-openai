import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RestaurantPreview from "@/components/RestaurantPreview";
import { NEARBY_LABELS } from "@/customConstants/labels";
import { NearbyPlaceType } from "@/interfaces/location";

const place = (over: Partial<NearbyPlaceType> = {}): NearbyPlaceType => ({
  id: "1",
  slug: "peter-luger",
  name: "Peter Luger",
  distance_km: 1.609344,
  ...over,
});

const show = (one: NearbyPlaceType | null, onClose = jest.fn()) =>
  render(
    <MemoryRouter>
      <RestaurantPreview place={one} onClose={onClose} />
    </MemoryRouter>,
  );

describe("RestaurantPreview", () => {
  it("shows nothing when no pin is selected", () => {
    const { container } = show(null);

    expect(container).toBeEmptyDOMElement();
  });

  it("links into the restaurant's menu", () => {
    show(place());

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      expect.stringContaining("peter-luger"),
    );
  });

  it("makes the whole card the link rather than a word inside it", () => {
    // A caption-sized target in a card is what a thumb misses.
    show(place());

    const link = screen.getByRole("link");

    expect(link).toHaveTextContent("Peter Luger");
    expect(link).toHaveTextContent(NEARBY_LABELS.seeDishes);
  });

  it("keeps the close button outside the link", () => {
    // A control nested inside a link is invalid, and browsers resolve it by
    // dropping one of them.
    show(place());

    expect(
      screen.getByRole("link").querySelector("button"),
    ).not.toBeInTheDocument();
  });

  it("shows the distance in miles", () => {
    show(place({ distance_km: 1.609344 }));

    expect(screen.getByText("1.0 mi")).toBeInTheDocument();
  });

  it("names the dish somebody photographed when there is one", () => {
    show(place({ top_dish_name: "Porterhouse for two" }));

    expect(screen.getByText(/Porterhouse for two/)).toBeInTheDocument();
  });

  it("asks for a photo when the restaurant has none", () => {
    // The common case, and the empty tile is the funnel.
    show(place());

    expect(screen.getByText(NEARBY_LABELS.noPhotos)).toBeInTheDocument();
  });

  it("omits a detail line rather than printing an empty one", () => {
    show(place({ cuisine: null, price_range: null, neighborhood: null }));

    expect(screen.queryByText("·")).not.toBeInTheDocument();
  });

  it("closes when asked", async () => {
    const onClose = jest.fn();
    show(place(), onClose);

    await userEvent.click(screen.getByRole("button"));

    expect(onClose).toHaveBeenCalled();
  });
});
