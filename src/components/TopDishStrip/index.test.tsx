import { render, screen } from "@testing-library/react";
import TopDishStrip from "@/components/TopDishStrip";
import { MenuItemType } from "@/interfaces/restaurants";
import { RANKING_LABELS } from "@/customConstants/labels";

const dish = (id: number, name: string): MenuItemType => ({
  id,
  name,
  description: "",
  category: "Sushi",
  top_choice: false,
  price: 24,
});

describe("TopDishStrip", () => {
  it("names what it is and whose opinion it is", () => {
    render(<TopDishStrip items={[dish(1, "Octopus")]} />);

    expect(
      screen.getByRole("heading", { name: RANKING_LABELS.topStripTitle }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(RANKING_LABELS.topStripSubtitle),
    ).toBeInTheDocument();
  });

  it("renders nothing when there is nothing to recommend", () => {
    // The caller is expected to skip it entirely, but a heading over an empty
    // rail is the exact thing being removed, so it also refuses here.
    const { container } = render(<TopDishStrip items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("never claims popularity it has not earned", () => {
    // The old heading was "Popular picks · not yet voted on", which is a
    // contradiction printed above a copy of the top of the menu.
    render(<TopDishStrip items={[dish(1, "Octopus")]} />);

    expect(screen.queryByText(/not yet voted on/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/popular picks/i)).not.toBeInTheDocument();
  });

  it("carries the anchor the sticky nav jumps to", () => {
    const { container } = render(
      <TopDishStrip items={[dish(1, "Octopus")]} id="menu-top-dishes" />,
    );

    expect(container.querySelector("#menu-top-dishes")).not.toBeNull();
  });

  it("hides the scrollbar without removing the scrolling", () => {
    // A full-width grey scrollbar under the food read as a desktop window
    // control. The rail still scrolls; only the bar is gone.
    const { container } = render(<TopDishStrip items={[dish(1, "Octopus")]} />);
    const rail = container.querySelector(".no-scrollbar");

    expect(rail).not.toBeNull();
    expect(rail).toHaveClass("overflow-x-auto");
  });

  it("shows every dish it was given", () => {
    render(
      <TopDishStrip
        items={[dish(1, "Octopus"), dish(2, "Snow Crab"), dish(3, "Hotate")]}
      />,
    );

    expect(screen.getByText("Octopus")).toBeInTheDocument();
    expect(screen.getByText("Snow Crab")).toBeInTheDocument();
    expect(screen.getByText("Hotate")).toBeInTheDocument();
  });

  it("keeps the scroll arrows out of the accessibility tree", () => {
    // They duplicate scrolling the rail, which a keyboard and a screen reader
    // can already do. Two extra tab stops per strip is noise.
    render(<TopDishStrip items={[dish(1, "Octopus")]} />);

    screen.getAllByRole("button").forEach((button) => {
      expect(button).not.toHaveAttribute("aria-hidden", "true");
    });
  });
});
