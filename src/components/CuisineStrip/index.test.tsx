import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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

const show = (tiles: CuisineTileType[], props: { loading?: boolean } = {}) =>
  render(
    <MemoryRouter>
      <CuisineStrip tiles={tiles} {...props} />
    </MemoryRouter>,
  );

describe("CuisineStrip", () => {
  it("says these are not photos of the restaurants here", () => {
    // The one thing this component must never let a reader get wrong. Every
    // other photograph in the product is evidence somebody was at a table.
    show([tile()]);

    expect(screen.getByText(CUISINE_LABELS.disclosure)).toBeInTheDocument();
  });

  it("credits the photographer and Unsplash, both linked", () => {
    // Not a nicety — Unsplash's API terms require both links wherever the
    // photo is shown.
    show([tile()]);

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
    show([tile()]);

    for (const name of ["Zhe ZHANG", "Unsplash"]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute(
        "rel",
        "noopener noreferrer",
      );
    }
  });

  it("makes the whole tile a link to that cuisine nearby", () => {
    // It used to be deliberately inert, because a cuisine search reached the
    // AI generation path — the one place this product spends real money — and
    // there was no cuisine route to land on. `/nearby` answers out of the
    // database, so the tap is free and it goes somewhere.
    show([tile()]);

    expect(
      screen.getByRole("link", { name: CUISINE_LABELS.findNearby("Japanese") }),
    ).toHaveAttribute("href", "/nearby?cuisine=japanese");
  });

  it("names the tile by what tapping it does", () => {
    // "Japanese" alone tells a screen reader a word, not a destination.
    show([tile()]);

    expect(
      screen.getByRole("link", { name: /find japanese food near you/i }),
    ).toBeInTheDocument();
  });

  it("keeps the credit outside the tile link", () => {
    // A link inside a link is invalid, and browsers resolve it by dropping
    // one — which would be the one Unsplash's terms require.
    show([tile()]);

    const tileLink = screen.getByRole("link", {
      name: CUISINE_LABELS.findNearby("Japanese"),
    });

    expect(tileLink.querySelector("a")).toBeNull();
    expect(screen.getByRole("link", { name: "Zhe ZHANG" })).toBeInTheDocument();
  });

  it("leaves the photograph out of the accessible name", () => {
    // The cuisine is the content; the stock photo illustrates it. Alt text
    // describing the picture would be read out before the destination.
    show([tile()]);

    expect(screen.queryByAltText("a bowl of ramen")).not.toBeInTheDocument();
  });

  it("renders nothing at all when there is nothing to show", () => {
    const { container } = show([]);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing while loading rather than a row of grey boxes", () => {
    const { container } = show([], { loading: true });

    expect(container).toBeEmptyDOMElement();
  });

  it("still shows the tile when a photo has no credit to give", () => {
    // Defensive: the server refuses to store an unattributable photo, so this
    // should be unreachable. If it ever happens, a missing credit must not
    // take the tile down with it.
    show([tile({ photographer: null })]);

    expect(screen.getByText("Japanese")).toBeInTheDocument();
    // The tile link survives; only the credit links are gone.
    expect(screen.queryByRole("link", { name: "Zhe ZHANG" })).toBeNull();
    expect(
      screen.getByRole("link", { name: CUISINE_LABELS.findNearby("Japanese") }),
    ).toBeInTheDocument();
  });
});
