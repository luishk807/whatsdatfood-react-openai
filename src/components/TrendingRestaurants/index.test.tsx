import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TrendingRestaurants from "@/components/TrendingRestaurants";
import { DISCOVERY_LABELS } from "@/customConstants/labels";
import {
  TrendingNearbyType,
  TrendingRestaurantType,
} from "@/interfaces/trending";

/**
 * The section that must not overclaim.
 *
 * Every test here is about the wording following the data: the server decides
 * whether six restaurants are a trend, and the heading has to say only what
 * can be supported.
 */
const restaurant = (
  over: Partial<TrendingRestaurantType> = {},
): TrendingRestaurantType => ({
  id: "1",
  slug: "nan-xiang",
  name: "Nan Xiang Xiao Long Bao",
  neighborhood: "Flushing",
  cuisine: "chinese",
  distance_km: 1.2,
  photo_count: 0,
  contributor_count: 0,
  ...over,
});

const payload = (over: Partial<TrendingNearbyType> = {}): TrendingNearbyType => ({
  mode: "popular",
  area_label: "Flushing",
  restaurants: [restaurant()],
  hot_pick: null,
  ...over,
});

const show = (
  trending: TrendingNearbyType | null,
  { hasLocation = true, loading = false } = {},
) =>
  render(
    <MemoryRouter>
      <TrendingRestaurants
        trending={trending}
        loading={loading}
        hasLocation={hasLocation}
        onChangeLocation={jest.fn()}
      />
    </MemoryRouter>,
  );

describe("TrendingRestaurants", () => {
  it("shows nothing before there is a location", () => {
    const { container } = show(payload(), { hasLocation: false });

    expect(container).toBeEmptyDOMElement();
  });

  it("shows nothing rather than an apology when there is nothing nearby", () => {
    // The search box above is what people came for.
    const { container } = show(payload({ restaurants: [] }));

    expect(container).toBeEmptyDOMElement();
  });

  it("says discover, not trending, until the server says trending", () => {
    // The whole point. Calling three page views a trend is the one thing
    // this section must never do.
    show(payload({ mode: "popular" }));

    expect(
      screen.getByText(DISCOVERY_LABELS.popularNear("Flushing")),
    ).toBeInTheDocument();
    expect(screen.queryByText(/trending/i)).not.toBeInTheDocument();
  });

  it("uses the stronger word once the server does", () => {
    show(payload({ mode: "trending" }));

    expect(
      screen.getByText(DISCOVERY_LABELS.trendingNear("Flushing")),
    ).toBeInTheDocument();
  });

  it("names the area rather than an address", () => {
    // "Trending near Flushing", never a street. The neighbourhood also
    // appears on the card below, so this looks at the heading specifically.
    show(payload({ mode: "trending", area_label: "Flushing" }));

    expect(
      screen.getByRole("heading", {
        name: DISCOVERY_LABELS.trendingNear("Flushing"),
      }),
    ).toBeInTheDocument();
  });

  it("falls back to 'near you' when the area has no name", () => {
    show(payload({ area_label: null }));

    expect(
      screen.getByText(DISCOVERY_LABELS.popularNearYou),
    ).toBeInTheDocument();
  });

  it("makes the whole card the link", () => {
    // A label-sized target inside a 160px card is what a thumb misses.
    show(payload());

    const link = screen
      .getAllByRole("link")
      .find((one) => one.textContent?.includes("Nan Xiang"));

    expect(link).toHaveAttribute("href", expect.stringContaining("nan-xiang"));
    expect(link).toHaveTextContent("Flushing");
  });

  it("offers a way into the full nearby list", () => {
    show(payload());

    expect(
      screen.getByRole("link", { name: new RegExp(DISCOVERY_LABELS.seeAllNearby) }),
    ).toBeInTheDocument();
  });

  it("puts the change control on the place name", async () => {
    // Somebody reading "near Flushing" in Brooklyn needs the fix to be where
    // the wrong word is.
    const onChangeLocation = jest.fn();

    render(
      <MemoryRouter>
        <TrendingRestaurants
          trending={payload()}
          hasLocation
          onChangeLocation={onChangeLocation}
        />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: /change/i }));

    expect(onChangeLocation).toHaveBeenCalled();
  });

  describe("the hot pick", () => {
    it("is absent when nothing has earned it", () => {
      // On a fresh catalogue this is the normal state. Filled with whatever
      // is nearest, the loudest thing on the page becomes a fabrication —
      // on the first run in Flushing that was a Dunkin' Donuts.
      show(payload({ hot_pick: null }));

      expect(screen.queryByText(DISCOVERY_LABELS.hotPick)).not.toBeInTheDocument();
      expect(
        screen.queryByText(DISCOVERY_LABELS.worthALook),
      ).not.toBeInTheDocument();
    });

    it("leads with the dish, not the restaurant", () => {
      // "What should I eat" rather than "what restaurants are near me".
      show(
        payload({
          mode: "trending",
          hot_pick: restaurant({
            top_dish_name: "Soup Dumplings",
            top_dish_photo_url: "https://example.invalid/a.jpg",
            contributor_count: 4,
          }),
        }),
      );

      expect(screen.getByText("Soup Dumplings")).toBeInTheDocument();
      expect(screen.getByText(DISCOVERY_LABELS.hotPick)).toBeInTheDocument();
    });

    it("softens the heading when the mode is only popular", () => {
      show(
        payload({
          mode: "popular",
          hot_pick: restaurant({ photo_count: 1 }),
        }),
      );

      expect(screen.getByText(DISCOVERY_LABELS.worthALook)).toBeInTheDocument();
      expect(screen.queryByText(DISCOVERY_LABELS.hotPick)).not.toBeInTheDocument();
    });

    it("asks for a photo rather than borrowing one", () => {
      // Stock imagery under a named restaurant would erase the distinction
      // the product rests on.
      show(payload({ hot_pick: restaurant({ top_dish_photo_url: null }) }));

      expect(screen.getByText(DISCOVERY_LABELS.noPhotoYet)).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("does not claim popularity from two people", () => {
      show(
        payload({
          mode: "trending",
          hot_pick: restaurant({ contributor_count: 2 }),
        }),
      );

      expect(screen.getByText(DISCOVERY_LABELS.whyHot(2))).toBeInTheDocument();
      expect(screen.queryByText(/photographing and voting/i)).not.toBeInTheDocument();
    });
  });
});
