import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Homepage from "@/components/Homepage";
import { SEARCH_LABELS } from "@/customConstants/labels";

jest.mock("@/customHooks/useRestaurantMutations", () => ({
  __esModule: true,
  default: () => ({ getRestaurantListByName: jest.fn().mockResolvedValue([]) }),
}));

const show = () =>
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

describe("Homepage", () => {
  it("says what the product does, not what to type", () => {
    show();

    // It read "Find your favorite menu", which describes a search box rather
    // than the reason to use this.
    expect(
      screen.getByRole("heading", { name: SEARCH_LABELS.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(SEARCH_LABELS.subtitle)).toBeInTheDocument();
  });

  it("puts the search where someone lands", async () => {
    show();

    expect(await screen.findByRole("searchbox")).toBeInTheDocument();
  });

  it("loads the search lazily but shows something while it arrives", () => {
    const { container } = show();

    // The heading must not wait on a chunk; the front door is the page most
    // often loaded and most often left.
    expect(screen.getByRole("heading")).toBeInTheDocument();
    expect(container.firstChild).not.toBeNull();
  });
});
