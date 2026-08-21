import { fireEvent, render, screen } from "@testing-library/react";
import RestaurantCover from "@/components/RestaurantCover";
import { COVER_SOURCE } from "@/customConstants/images";
import { RestaurantImagerySource } from "@/interfaces/imagery";

/**
 * The card's picture, and the promise that it is never a hole.
 *
 * Everything asserted here is about failure, because failure is the common
 * case: most restaurants have no community photograph, third-party hosts
 * refuse hotlinks constantly, and a borrowed Google resource expires. The
 * component's job is that none of those ever reaches the reader as a broken
 * image or an empty rectangle.
 */
const show = (over: Partial<RestaurantImagerySource> = {}) =>
  render(<RestaurantCover restaurant={{ ...over }} />);

/** The drawing, which is deliberately not an `img`. */
const fallback = () =>
  document.querySelector(`[data-cover-source="${COVER_SOURCE.fallback}"]`);

describe("RestaurantCover", () => {
  it("shows the community photograph when there is one", () => {
    show({ top_dish_photo_url: "https://example.test/community.jpg" });

    expect(screen.getByRole("presentation", { hidden: true })).toBeTruthy();
    expect(document.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.test/community.jpg",
    );
  });

  it("draws the cuisine when there is no photograph at all", () => {
    // The state most cards are in on a cold catalogue, and it is designed
    // rather than tolerated: our own artwork, not a camera in a grey box.
    show({ cuisine: "chinese" });

    expect(document.querySelector("img")).toBeNull();
    expect(fallback()).toBeTruthy();
  });

  it("draws something even for a cuisine it has never heard of", () => {
    // A category invented on the server must not produce a hole in the page
    // before anybody has drawn a glyph for it.
    show({ cuisine: "ethiopian" });

    expect(fallback()).toBeTruthy();
  });

  it("falls forward to the next source when one fails", () => {
    // A 403 is routine. The card moves on rather than showing the broken
    // image glyph.
    show({
      top_dish_photo_url: "https://example.test/community.jpg",
      google_photo_url: "https://example.test/google.jpg",
    });

    fireEvent.error(document.querySelector("img")!);

    expect(document.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.test/google.jpg",
    );
  });

  it("ends at the drawing rather than at a broken image", () => {
    show({
      top_dish_photo_url: "https://example.test/community.jpg",
      cuisine: "italian",
    });

    fireEvent.error(document.querySelector("img")!);

    expect(document.querySelector("img")).toBeNull();
    expect(fallback()).toBeTruthy();
  });

  it("prints the Google credit beside a Google photograph", () => {
    // Required by Google's terms wherever the photo is shown. Not optional
    // and not a cosmetic detail.
    show({
      google_photo_url: "https://example.test/google.jpg",
      google_photo_attribution: "A Photographer",
    });

    expect(screen.getByText(/A Photographer/)).toBeInTheDocument();
  });

  it("prints no credit beside a diner's own photograph", () => {
    show({
      top_dish_photo_url: "https://example.test/community.jpg",
      google_photo_attribution: "A Photographer",
    });

    expect(screen.queryByText(/A Photographer/)).not.toBeInTheDocument();
  });

  it("lazy-loads by default and eagerly only when asked", () => {
    // Lazy-loading a card the reader is looking at delays the one thing the
    // page is for; eager-loading one six rows down wastes a request.
    show({ top_dish_photo_url: "https://example.test/a.jpg" });
    expect(document.querySelector("img")).toHaveAttribute("loading", "lazy");

    render(
      <RestaurantCover
        restaurant={{ top_dish_photo_url: "https://example.test/b.jpg" }}
        eager
      />,
    );

    expect(
      document.querySelectorAll("img")[1],
    ).toHaveAttribute("loading", "eager");
  });

  it("occupies its box before any image loads", () => {
    // The layout-shift guarantee: the container is present and sized whether
    // or not a photograph ever arrives, so a late one cannot push the name
    // and the distance down the page.
    //
    // Only half of this is assertable here — jsdom implements no
    // `aspect-ratio`, so the inline ratio is dropped from the element and
    // cannot be read back. What is checked is that the box itself is always
    // rendered; the ratio riding on it is a one-line style verified in a
    // browser.
    const { container } = render(<RestaurantCover restaurant={{}} />);

    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bg-surface-sunken");
  });

});

describe("the size belongs to whoever places the card", () => {
  it("does not impose a width the caller did not ask for", () => {
    // The mobile bug. This forced `w-full`, and a caller asking for `w-20`
    // lost — Tailwind utilities of equal specificity are decided by their
    // order in the stylesheet, not by their order in the class attribute. So
    // every row of the nearby list became a full-width photograph with the
    // restaurant's name crushed into a column one word wide.
    const { container } = render(
      <RestaurantCover restaurant={{}} className="h-20 w-20 shrink-0" />,
    );

    expect(container.firstChild).toHaveClass("w-20");
    expect(container.firstChild).not.toHaveClass("w-full");
  });

  it("still lets a caller ask for the full width", () => {
    const { container } = render(
      <RestaurantCover restaurant={{}} className="h-28 w-full" />,
    );

    expect(container.firstChild).toHaveClass("w-full");
  });
});
