import { render, screen } from "@testing-library/react";
import MenuProvenance from "@/components/MenuProvenance";
import {
  MENU_AVAILABILITY,
  MENU_AVAILABILITY_LABELS,
} from "@/customConstants/labels";

/**
 * Whose menu this is, said once.
 *
 * An incomplete list presented as *the* menu is the one mistake this product
 * cannot afford, because somebody orders from it.
 */
describe("whose menu it is", () => {
  it("says nothing when the restaurant has spoken for itself", () => {
    // "Menu" unqualified is exactly right there, and a badge reading
    // "official" would make every other menu look suspect by contrast.
    const { container } = render(
      <MenuProvenance availability={MENU_AVAILABILITY.official} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("says so when diners built it", () => {
    render(<MenuProvenance availability={MENU_AVAILABILITY.community} />);

    expect(
      screen.getByText(MENU_AVAILABILITY_LABELS[MENU_AVAILABILITY.community]),
    ).toBeInTheDocument();
  });

  it("admits when it was only read automatically", () => {
    // A seed, not a source of truth: an inference the day it was made that
    // goes stale the week a restaurant reprints.
    render(<MenuProvenance availability={MENU_AVAILABILITY.partial} />);

    expect(screen.getByText(/not confirmed/i)).toBeInTheDocument();
  });

  it("never asserts that a menu is complete", () => {
    // Substring matching would fail the community wording, which says "may
    // not be the full menu" - a disclaimer, and the opposite of the claim
    // being guarded against. What must not appear is an affirmative one.
    const copy = Object.values(MENU_AVAILABILITY_LABELS).join(" ").toLowerCase();

    for (const claim of [
      "complete menu",
      "the full menu is",
      "every dish",
      "all dishes",
    ]) {
      expect(copy).not.toContain(claim);
    }
  });

  it("renders nothing for a state it has no words for", () => {
    const { container } = render(<MenuProvenance availability="invented" />);

    expect(container).toBeEmptyDOMElement();
  });
});
