import { render, screen } from "@testing-library/react";
import CuisineStrip from "@/components/CuisineStrip";
import { CUISINE_LABELS } from "@/customConstants/labels";
import { CuisineTileType } from "@/interfaces/generic";

const tile = (overrides: Partial<CuisineTileType> = {}): CuisineTileType => ({
  category: "japanese",
  label: "Japanese",
  url: "https://images.unsplash.test/full.jpg",
  thumb_url: "https://images.unsplash.test/small.jpg",
  alt: "a bowl of ramen",
  photographer: "Zhe ZHANG",
  photographer_url: "https://unsplash.test/@doublez?utm_source=whatsdatfood",
  provider_url: "https://unsplash.test/?utm_source=whatsdatfood",
  provider: "unsplash",
  ...overrides,
});

describe("CuisineStrip", () => {
  it("says these are not photos of the restaurants here", () => {
    // The one thing this component must never let a reader get wrong. Every
    // other photograph in the product is evidence somebody was at a table.
    render(<CuisineStrip tiles={[tile()]} />);

    expect(screen.getByText(CUISINE_LABELS.disclosure)).toBeInTheDocument();
  });

  it("credits the photographer and Unsplash, both linked", () => {
    // Not a nicety — Unsplash's API terms require both links wherever the
    // photo is shown.
    render(<CuisineStrip tiles={[tile()]} />);

    expect(screen.getByRole("link", { name: "Zhe ZHANG" })).toHaveAttribute(
      "href",
      "https://unsplash.test/@doublez?utm_source=whatsdatfood",
    );
    expect(screen.getByRole("link", { name: "Unsplash" })).toHaveAttribute(
      "href",
      "https://unsplash.test/?utm_source=whatsdatfood",
    );
  });

  it("opens credit links safely in a new tab", () => {
    render(<CuisineStrip tiles={[tile()]} />);

    for (const name of ["Zhe ZHANG", "Unsplash"]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute(
        "rel",
        "noopener noreferrer",
      );
    }
  });

  it("does not make the tile itself tappable", () => {
    // Searching a cuisine reaches the AI generation path, which is where this
    // product spends real money. A grid on the front door where every tap
    // opens the wallet is a bad idea whatever the rate limit says — and there
    // is no cuisine-browse route to land on either.
    render(<CuisineStrip tiles={[tile()]} />);

    expect(screen.queryByRole("button")).toBeNull();
    // Only the two credit links, nothing wrapping the image.
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("renders nothing at all when there is nothing to show", () => {
    const { container } = render(<CuisineStrip tiles={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing while loading rather than a row of grey boxes", () => {
    const { container } = render(<CuisineStrip tiles={[]} loading />);

    expect(container).toBeEmptyDOMElement();
  });

  it("still shows the tile when a photo has no credit to give", () => {
    // Defensive: the server refuses to store an unattributable photo, so this
    // should be unreachable. If it ever happens, a missing credit must not
    // take the tile down with it.
    render(<CuisineStrip tiles={[tile({ photographer: null })]} />);

    expect(screen.getByText("Japanese")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
