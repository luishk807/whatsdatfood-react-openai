import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PhotoWall from "@/components/PhotoWall";
import { ShowcasePhoto } from "@/interfaces/ranking";
import { SHOWCASE_LABELS, DISH_LABELS } from "@/customConstants/labels";
import { SHOWCASE } from "@/customConstants/images";

const photo = (over: Partial<ShowcasePhoto> = {}): ShowcasePhoto => ({
  id: "1",
  url_s: "https://example.test/anago-small.jpg",
  url_m: "https://example.test/anago.jpg",
  dish_name: "Anago",
  restaurant_name: "Sushi Noz",
  restaurant_slug: "sushi-noz-181-e-78th-st",
  owner: null,
  ...over,
});

const show = (props: Partial<Parameters<typeof PhotoWall>[0]> = {}) =>
  render(
    <MemoryRouter>
      <PhotoWall photos={[photo()]} {...props} />
    </MemoryRouter>,
  );

describe("PhotoWall", () => {
  it("captions a photo with the dish and the restaurant", () => {
    // A photo on its own is decoration. It has to say what it is.
    show();

    expect(screen.getByText("Anago")).toBeInTheDocument();
    expect(screen.getByText("Sushi Noz")).toBeInTheDocument();
  });

  it("sends a tap to that restaurant's menu", () => {
    show();

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/menu-results/sushi-noz-181-e-78th-st",
    );
  });

  it("names the destination for a screen reader, not the picture", () => {
    show();

    expect(
      screen.getByRole("link", {
        name: SHOWCASE_LABELS.tileLabel("Anago", "Sushi Noz"),
      }),
    ).toBeInTheDocument();
  });

  it("renders nothing at all when there are no photos", () => {
    // Not an empty state: the search box above still works, and a wall
    // announcing its own failure makes the page look broken.
    const { container } = render(
      <MemoryRouter>
        <PhotoWall photos={[]} />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows placeholders while loading rather than collapsing", () => {
    // The wall appears under the search box. If it has no height until the
    // photos land, the whole page jumps when they do.
    const { container } = render(
      <MemoryRouter>
        <PhotoWall photos={[]} loading />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: SHOWCASE_LABELS.heading }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("li")).toHaveLength(SHOWCASE.LIMIT);
  });

  it("prefers the thumbnail over the full-size photo", () => {
    // A wall of full-size images is megabytes on the slowest screen in the
    // product, which is the one this page is designed for.
    show();

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.test/anago-small.jpg",
    );
  });

  it("falls back to the full-size photo when there is no thumbnail", () => {
    // Only community uploads generate a thumbnail, so requiring one would
    // blank every image-search photo — which is all of them so far.
    show({ photos: [photo({ url_s: null })] });

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.test/anago.jpg",
    );
  });

  it("credits an uploader", () => {
    show({ photos: [photo({ owner: "luis" })] });

    expect(screen.getByText(DISH_LABELS.photoBy("luis"))).toBeInTheDocument();
  });

  it("does not badge a stock photo as community work", () => {
    // The badge is a claim about provenance. Twelve "Stock photo" chips would
    // also be chrome competing with the food.
    show();

    expect(
      screen.queryByText(DISH_LABELS.communityPhoto),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(DISH_LABELS.stockPhoto)).not.toBeInTheDocument();
  });

  it("badges a community photo, because that is the premise", () => {
    show({ photos: [photo({ owner: "luis" })] });

    expect(screen.getByText(DISH_LABELS.communityPhoto)).toBeInTheDocument();
  });

  it("loads the photos above the fold eagerly and the rest lazily", () => {
    const many = Array.from({ length: 6 }, (_unused, index) =>
      photo({
        id: String(index),
        url_s: `https://example.test/${index}.jpg`,
        dish_name: `Dish ${index}`,
      }),
    );

    show({ photos: many, eagerCount: 2 });

    const loading = screen
      .getAllByRole("img")
      .map((image) => image.getAttribute("loading"));

    expect(loading).toEqual(["eager", "eager", "lazy", "lazy", "lazy", "lazy"]);
  });

  it("drops a tile whose photo the host refused", async () => {
    // Two of twelve 403'd against the real dataset. On a menu an empty tile is
    // the upload funnel; here it is a hole in the only thing the page shows.
    show({
      photos: [
        photo({ id: "1", dish_name: "Anago" }),
        photo({ id: "2", dish_name: "Octopus" }),
      ],
    });

    fireEvent.error(screen.getByAltText("Anago"));

    expect(await screen.findByText("Octopus")).toBeInTheDocument();
    expect(screen.queryByText("Anago")).not.toBeInTheDocument();
  });

  it("disappears entirely once every photo has failed", () => {
    const { container } = render(
      <MemoryRouter>
        <PhotoWall photos={[photo({ id: "1", dish_name: "Anago" })]} />
      </MemoryRouter>,
    );

    fireEvent.error(screen.getByAltText("Anago"));

    expect(container).toBeEmptyDOMElement();
  });

  it("does not show the unavailable placeholder in place of food", () => {
    show({ photos: [photo({ id: "1", dish_name: "Anago" })] });

    fireEvent.error(screen.getByAltText("Anago"));

    expect(
      screen.queryByText(DISH_LABELS.photoFailed),
    ).not.toBeInTheDocument();
  });

  it("keys tiles by photo id, so the wall reordering does not scramble it", () => {
    // Two dishes with the same name at different restaurants must both render;
    // keying on the caption would collapse them.
    show({
      photos: [
        photo({ id: "1", dish_name: "House Salad", restaurant_name: "Luger" }),
        photo({ id: "2", dish_name: "House Salad", restaurant_name: "Chun" }),
      ],
    });

    expect(screen.getAllByText("House Salad")).toHaveLength(2);
  });
});
