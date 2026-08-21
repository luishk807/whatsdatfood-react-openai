import { fireEvent, render, screen } from "@testing-library/react";
import HeroImage from "@/components/HeroImage";
import { HERO_SOURCE } from "@/customConstants/images";
import { HeroImageType } from "@/interfaces/imagery";

/**
 * The decorative panel behind the auth pages.
 *
 * What matters here is that it degrades: a missing image, a refused image and
 * no image at all must all leave a designed panel with readable type over it,
 * because a hole behind a sign-in form is a bad first impression and a broken
 * image icon is a worse one.
 */
const community: HeroImageType = {
  url: "https://example.test/community.jpg",
  source: HERO_SOURCE.community,
  alt: "",
  caption: "Spicy Miso Ramen",
  credit: { text: "luis", url: null },
};

const curated: HeroImageType = {
  url: "https://example.test/unsplash.jpg",
  source: HERO_SOURCE.curated,
  alt: "",
  caption: null,
  credit: { text: "A Photographer", url: "https://unsplash.test/@a" },
};

const show = (image: HeroImageType | null) =>
  render(
    <HeroImage image={image}>
      <p>Know what to order.</p>
    </HeroImage>,
  );

describe("HeroImage", () => {
  it("keeps the words whether or not there is a photograph", () => {
    show(null);
    expect(screen.getByText("Know what to order.")).toBeInTheDocument();

    show(community);
    expect(screen.getAllByText("Know what to order.").length).toBeGreaterThan(0);
  });

  it("draws no image at all when there is none", () => {
    // The plain brand panel, which is a designed state — a new deployment has
    // no photographs and a grey hole is worse than a green field.
    const { container } = show(null);

    expect(container.querySelector("img")).toBeNull();
  });

  it("falls back to the panel when the photograph is refused", () => {
    // Third-party hosts 403 constantly, and a broken-image icon on the
    // sign-in page is the worst version of this.
    const { container } = show(community);

    fireEvent.error(container.querySelector("img")!);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Know what to order.")).toBeInTheDocument();
  });

  it("names the dish and the diner on a community photograph", () => {
    show(community);

    expect(screen.getByText(/Spicy Miso Ramen · @luis/)).toBeInTheDocument();
  });

  it("credits a curated photograph and names no dish", () => {
    // The line the product's credibility rests on: a stock photograph must
    // never read as a photograph of a particular kitchen's food.
    show(curated);

    expect(screen.getByText(/A Photographer/)).toBeInTheDocument();
    expect(screen.queryByText(/Spicy Miso Ramen/)).not.toBeInTheDocument();
  });

  it("stays out of the accessibility tree", () => {
    // The pitch is repeated in the form beside it, so announcing the panel
    // would read it twice.
    const { container } = show(community);

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("fades the photograph in rather than showing a spinner", () => {
    const { container } = show(community);
    const image = container.querySelector("img")!;

    expect(image).toHaveClass("opacity-0");

    fireEvent.load(image);

    expect(image).toHaveClass("opacity-100");
  });
});
