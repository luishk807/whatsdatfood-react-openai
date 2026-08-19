import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TrendingStrip from "@/components/TrendingStrip";
import { TRENDING_LABELS } from "@/customConstants/labels";
import { NearbyDiscoveryType } from "@/interfaces/location";

const dish = (overrides = {}) => ({
  dish_id: "1",
  dish_name: "Soup Dumplings",
  restaurant_name: "Shanghai You Garden",
  restaurant_slug: "shanghai-you-garden",
  distance_km: 0.64,
  photo_url: "https://media.test/dumplings.jpg",
  photo_thumb_url: "https://media.test/dumplings-s.jpg",
  photographer: "ada",
  score: 12,
  photo_count: 3,
  vote_count: 8,
  contributor_count: 4,
  ...overrides,
});

const needsPhoto = (overrides = {}) => ({
  dish_id: "9",
  dish_name: "Hand Pulled Noodles",
  restaurant_name: "Golden Mall",
  restaurant_slug: "golden-mall",
  distance_km: 0.3,
  ...overrides,
});

const show = (
  discovery: NearbyDiscoveryType | null,
  props: { loading?: boolean; hasLocation?: boolean } = {},
) =>
  render(
    <MemoryRouter>
      <TrendingStrip
        discovery={discovery}
        hasLocation={props.hasLocation ?? true}
        loading={props.loading}
        onChangeLocation={jest.fn()}
      />
    </MemoryRouter>,
  );

describe("TrendingStrip", () => {
  describe("with real activity", () => {
    const populated: NearbyDiscoveryType = {
      area_label: "Flushing",
      mode: "trending",
      trending: [dish(), dish({ dish_id: "2", dish_name: "Lamb Skewers" })],
      needs_photos: [],
    };

    it("names the area rather than where somebody is standing", () => {
      show(populated);

      expect(
        screen.getByRole("heading", {
          name: TRENDING_LABELS.titleNear("Flushing"),
        }),
      ).toBeInTheDocument();
    });

    it("makes the whole card a link to the restaurant", () => {
      // A title-sized target inside a 180px tile is what a thumb misses.
      show(populated);

      expect(
        screen.getByRole("link", { name: /soup dumplings/i }),
      ).toHaveAttribute("href", "/menu-results/shanghai-you-garden");
    });

    it("shows the real counts, not a popularity adjective", () => {
      show(populated);

      expect(screen.getAllByText(/3 photos · 8 votes/).length).toBeGreaterThan(
        0,
      );
    });

    it("credits the photographer", () => {
      show(populated);

      expect(
        screen.getAllByText(TRENDING_LABELS.photoBy("ada")).length,
      ).toBeGreaterThan(0);
    });

    it("says how far away it is in miles", () => {
      show(populated);

      expect(screen.getAllByText(/0\.4 mi/).length).toBeGreaterThan(0);
    });

    it("offers a way to change the place it is talking about", async () => {
      // Somebody reading "near Flushing" while sitting in Brooklyn needs the
      // fix to be where the wrong word is.
      const onChangeLocation = jest.fn();
      render(
        <MemoryRouter>
          <TrendingStrip
            discovery={populated}
            hasLocation
            onChangeLocation={onChangeLocation}
          />
        </MemoryRouter>,
      );

      await userEvent.click(screen.getByRole("button", { name: /change/i }));

      expect(onChangeLocation).toHaveBeenCalled();
    });
  });

  describe("before there is anything to trend", () => {
    const early: NearbyDiscoveryType = {
      area_label: "Flushing",
      mode: "contribute",
      trending: [],
      needs_photos: [needsPhoto()],
    };

    it("asks for photographs instead of inventing popularity", () => {
      // The one thing this section must never do.
      show(early);

      expect(
        screen.getByRole("heading", {
          name: TRENDING_LABELS.contributeTitle("Flushing"),
        }),
      ).toBeInTheDocument();
    });

    it("names a real dish at a real restaurant nearby", () => {
      show(early);

      expect(screen.getByText("Hand Pulled Noodles")).toBeInTheDocument();
      expect(screen.getByText("Golden Mall")).toBeInTheDocument();
      expect(
        screen.getAllByText(new RegExp(TRENDING_LABELS.noPhotos, "i")).length,
      ).toBeGreaterThan(0);
    });

    it("leads into the upload flow", () => {
      show(early);

      expect(
        screen.getByRole("link", { name: /hand pulled noodles/i }),
      ).toHaveAttribute("href", "/menu-results/golden-mall");
      expect(screen.getByText(TRENDING_LABELS.addFirst)).toBeInTheDocument();
    });
  });

  describe("when it has nothing to say", () => {
    it("renders nothing without a location", () => {
      // Asking for one is the job of the control above, not of a section that
      // would be empty either way.
      const { container } = show(null, { hasLocation: false });

      expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing when both lists are empty", () => {
      const { container } = show({
        area_label: "Flushing",
        mode: "contribute",
        trending: [],
        needs_photos: [],
      });

      expect(container).toBeEmptyDOMElement();
    });

    it("shows a placeholder while it is still asking", () => {
      const { container } = show(null, { loading: true });

      expect(container).not.toBeEmptyDOMElement();
    });
  });
});
