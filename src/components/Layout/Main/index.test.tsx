import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Layout from "@/components/Layout/Main";

/**
 * The app shell, and the one thing about it that has broken.
 *
 * `Header` renders a `position: sticky` bar. A sticky element can only travel
 * inside its containing block, and this shell used to wrap that bar in a
 * second `<header>` — a box exactly the height of the bar itself. Travel of
 * zero, so the bar scrolled away with the page like any other element and had
 * never actually been pinned.
 *
 * Nothing looked wrong until something else was pinned *below* it: `/nearby`
 * offsets its map by the bar's height, so on a phone the map went on
 * reserving that strip for a bar no longer on screen, and the restaurant list
 * showed through the gap.
 *
 * A duplicated landmark is the readable symptom of the layout fault, so that
 * is what is asserted here — jsdom lays nothing out and cannot be asked
 * whether an element is sticking.
 */
jest.mock("@/components/AccountButton", () => ({
  __esModule: true,
  default: () => null,
}));

const show = () =>
  render(
    <MemoryRouter>
      <Layout>
        <p>Some food</p>
      </Layout>
    </MemoryRouter>,
  );

describe("the app shell", () => {
  it("gives the sticky bar a containing block it can travel in", () => {
    // One banner, and it is the sticky one. A second wrapper around it is
    // both the extra landmark and the box that held the bar in place.
    show();

    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getByRole("banner").className).toContain("sticky");
  });

  it("does not put a landmark inside an identical landmark", () => {
    show();

    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  });

  it("still renders the page between them", () => {
    show();

    expect(screen.getByText("Some food")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
