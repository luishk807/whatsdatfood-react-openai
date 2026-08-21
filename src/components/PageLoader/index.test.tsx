import { render, screen } from "@testing-library/react";
import PageLoader from "@/components/PageLoader";
import { LOADING_LABELS } from "@/customConstants/labels";

/**
 * The route loader, and the bug it exists because of.
 *
 * Every lazy route rendered `<Loading style={{ width: "30px" }} />`. An
 * inline width beats a class, so `w-full items-center justify-center` was
 * overridden and the loader collapsed into a thirty-pixel box pinned to the
 * top-left corner - on twenty-three routes, on every navigation, looking
 * exactly like a broken image.
 */
describe("holding the space a page is about to fill", () => {
  it("is full width, so it can centre anything", () => {
    const { container } = render(<PageLoader />);
    const box = container.firstElementChild;

    expect(box).toHaveClass("w-full");
  });

  it("carries no inline width to override that", () => {
    // The whole bug in one assertion. A style attribute here beats every
    // class beside it, silently.
    const { container } = render(<PageLoader />);
    const box = container.firstElementChild as HTMLElement;

    expect(box.style.width).toBe("");
  });

  it("centres what it is holding", () => {
    const { container } = render(<PageLoader />);
    const box = container.firstElementChild;

    expect(box).toHaveClass("items-center");
    expect(box).toHaveClass("justify-center");
  });

  it("reserves height so the page does not jump when it arrives", () => {
    const { container } = render(<PageLoader />);

    expect(container.firstElementChild?.className).toMatch(/min-h-/);
  });
});

describe("what it tells somebody who cannot see it", () => {
  it("announces itself", () => {
    // A spinning ring and nothing else says nothing to a screen reader, which
    // is the reader most likely to be on the slow connection.
    render(<PageLoader />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has readable text, not just a shape", () => {
    render(<PageLoader />);

    expect(screen.getByText(LOADING_LABELS.page)).toBeInTheDocument();
  });
});

describe("motion", () => {
  it("stops for somebody who asked for less of it", () => {
    const { container } = render(<PageLoader />);

    expect(container.innerHTML).toContain("motion-reduce:animate-none");
  });

  it("draws the spinner rather than fetching one", () => {
    // It was an animated GIF: a network request for a spinner, which cannot
    // take the theme and cannot stop moving.
    const { container } = render(<PageLoader />);

    expect(container.querySelector("img")).toBeNull();
  });
});
