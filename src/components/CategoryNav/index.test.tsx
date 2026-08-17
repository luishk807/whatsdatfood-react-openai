import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryNav from "@/components/CategoryNav";
import { MenuSection } from "@/interfaces/ranking";

const sections: MenuSection[] = [
  { id: "menu-top-dishes", label: "Most loved" },
  { id: "menu-section-appetizers", label: "Appetizers" },
  { id: "menu-section-sushi", label: "Sushi" },
];

describe("CategoryNav", () => {
  it("offers a chip per section", () => {
    render(<CategoryNav sections={sections} onJump={jest.fn()} />);

    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Appetizers" }),
    ).toBeInTheDocument();
  });

  it("reports which section was asked for", async () => {
    const onJump = jest.fn();
    render(<CategoryNav sections={sections} onJump={onJump} />);

    await userEvent.click(screen.getByRole("button", { name: "Sushi" }));

    expect(onJump).toHaveBeenCalledWith("menu-section-sushi");
  });

  it("marks the section being read, for the eye and the screen reader", () => {
    render(
      <CategoryNav
        sections={sections}
        activeId="menu-section-sushi"
        onJump={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Sushi" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Appetizers" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("does not render for a menu with one section", () => {
    // A single category is not something to navigate; the bar would only take
    // space the food should have.
    const { container } = render(
      <CategoryNav sections={[sections[0]]} onJump={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("does not render for a menu with no sections", () => {
    const { container } = render(
      <CategoryNav sections={[]} onJump={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("stays put when the page scrolls", () => {
    // The moment it scrolls away it stops being navigation and becomes a
    // heading, which is the entire reason it exists.
    render(<CategoryNav sections={sections} onJump={jest.fn()} />);

    expect(screen.getByRole("navigation")).toHaveClass("sticky");
  });

  it("never scrolls the page to keep a chip visible", () => {
    // scrollIntoView scrolls every scrollable ancestor, the page included.
    // Tapping the last category started the page moving, the highlight changed
    // on the way, and this effect hauled the page back: the jump to Dessert
    // landed 198px down and stopped there. The rail scrolls itself instead.
    const intoView = jest.fn();
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = intoView;

    const { rerender } = render(
      <CategoryNav
        sections={sections}
        activeId="menu-top-dishes"
        onJump={jest.fn()}
      />,
    );

    rerender(
      <CategoryNav
        sections={sections}
        activeId="menu-section-sushi"
        onJump={jest.fn()}
      />,
    );

    expect(intoView).not.toHaveBeenCalled();

    Element.prototype.scrollIntoView = original;
  });

  it("scrolls its own rail when the highlight moves off screen", () => {
    const scrollTo = jest.fn();
    const original = Element.prototype.scrollTo;
    Element.prototype.scrollTo = scrollTo;

    const { container, rerender } = render(
      <CategoryNav
        sections={sections}
        activeId="menu-top-dishes"
        onJump={jest.fn()}
      />,
    );

    // jsdom lays nothing out, so the rail and the off-screen chip are given the
    // geometry they would have on a narrow phone: a 300px rail with the third
    // chip sitting past its right edge.
    const rail = container.querySelector(".no-scrollbar") as HTMLElement;
    rail.getBoundingClientRect = () =>
      ({ left: 0, right: 300, width: 300 }) as DOMRect;

    const chip = screen.getByRole("button", { name: "Sushi" });
    chip.getBoundingClientRect = () =>
      ({ left: 380, right: 460, width: 80 }) as DOMRect;

    rerender(
      <CategoryNav
        sections={sections}
        activeId="menu-section-sushi"
        onJump={jest.fn()}
      />,
    );

    // Centred: 380 - (300 - 80) / 2 = 270.
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: 270 }),
    );

    Element.prototype.scrollTo = original;
  });

  it("leaves the rail alone when the chip is already visible", () => {
    const scrollTo = jest.fn();
    const original = Element.prototype.scrollTo;
    Element.prototype.scrollTo = scrollTo;

    const { rerender } = render(
      <CategoryNav
        sections={sections}
        activeId="menu-top-dishes"
        onJump={jest.fn()}
      />,
    );

    // Every rect is zero here, so every chip reads as inside the rail.
    rerender(
      <CategoryNav
        sections={sections}
        activeId="menu-section-sushi"
        onJump={jest.fn()}
      />,
    );

    expect(scrollTo).not.toHaveBeenCalled();

    Element.prototype.scrollTo = original;
  });

  it("names itself, since a page can hold more than one nav", () => {
    render(<CategoryNav sections={sections} onJump={jest.fn()} />);

    expect(
      screen.getByRole("navigation", { name: /menu sections/i }),
    ).toBeInTheDocument();
  });
});
