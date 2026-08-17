import { act, renderHook } from "@testing-library/react";
import useActiveSection from "@/customHooks/useActiveSection";

/**
 * jsdom lays nothing out, so every element reports a zero rect. Each section is
 * given the top it would have on a real page.
 */
const placeSections = (tops: Record<string, number>) => {
  Object.entries(tops).forEach(([id, top]) => {
    const node = document.createElement("section");
    node.id = id;
    node.getBoundingClientRect = () => ({ top }) as DOMRect;
    document.body.appendChild(node);
  });
};

const scroll = () => act(() => void window.dispatchEvent(new Event("scroll")));

/** jsdom reports zero for all of these, so a scroll position has to be faked. */
const atPage = ({ y, height }: { y: number; height: number }) => {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  Object.defineProperty(window, "innerHeight", {
    value: 800,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: height,
    configurable: true,
  });
};

describe("useActiveSection", () => {
  beforeEach(() => {
    atPage({ y: 0, height: 5000 });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("starts on the first section", () => {
    placeSections({ a: 0, b: 800, c: 1600 });

    const { result } = renderHook(() => useActiveSection(["a", "b", "c"]));

    expect(result.current).toBe("a");
  });

  it("is null when there are no sections", () => {
    const { result } = renderHook(() => useActiveSection([]));

    expect(result.current).toBeNull();
  });

  it("reports the last section whose top has passed the line", () => {
    // Several sections cross a tall viewport at once. The one being read is the
    // last one to have started, not the first one still visible.
    placeSections({ a: -900, b: -200, c: 700 });

    const { result } = renderHook(() => useActiveSection(["a", "b", "c"]));
    scroll();

    expect(result.current).toBe("b");
  });

  it("stays on the first section while it is still above the line", () => {
    placeSections({ a: 40, b: 900 });

    const { result } = renderHook(() => useActiveSection(["a", "b"]));
    scroll();

    expect(result.current).toBe("a");
  });

  it("follows the reader to the bottom of the menu", () => {
    placeSections({ a: -2000, b: -1200, c: -300 });

    const { result } = renderHook(() => useActiveSection(["a", "b", "c"]));
    scroll();

    expect(result.current).toBe("c");
  });

  it("highlights the last section once the page is scrolled to the bottom", () => {
    // A short final category can never bring its own top past the line,
    // because the page runs out of scroll first. Jumping to the last chip
    // highlighted the one before it: the bar said Soup while the reader was
    // looking at Dessert.
    placeSections({ a: -3000, b: -2000, c: 300 });
    atPage({ y: 4200, height: 5000 });

    const { result } = renderHook(() => useActiveSection(["a", "b", "c"]));
    scroll();

    expect(result.current).toBe("c");
  });

  it("does not jump to the last section merely because it is visible", () => {
    // Only at the bottom. Mid-page the normal rule has to win, or every
    // scroll past the middle would highlight the end of the menu.
    placeSections({ a: -900, b: -200, c: 700 });
    atPage({ y: 900, height: 5000 });

    const { result } = renderHook(() => useActiveSection(["a", "b", "c"]));
    scroll();

    expect(result.current).toBe("b");
  });

  it("ignores a missing element when picking the bottom section", () => {
    placeSections({ a: -3000, b: -2000 });
    atPage({ y: 4200, height: 5000 });

    const { result } = renderHook(() => useActiveSection(["a", "b", "gone"]));
    scroll();

    expect(result.current).toBe("b");
  });

  it("ignores an id with no element on the page", () => {
    // A category can disappear between renders when the menu is refetched.
    placeSections({ a: -500 });

    const { result } = renderHook(() => useActiveSection(["a", "gone"]));
    scroll();

    expect(result.current).toBe("a");
  });

  it("does not resubscribe when given an equal array each render", () => {
    // A fresh array of the same ids on every render is the shape that has
    // turned into a request loop three times in this codebase.
    placeSections({ a: 0, b: 900 });

    const add = jest.spyOn(window, "addEventListener");
    const { rerender } = renderHook(() => useActiveSection(["a", "b"]));

    const afterFirst = add.mock.calls.filter(([e]) => e === "scroll").length;

    rerender();
    rerender();

    expect(
      add.mock.calls.filter(([e]) => e === "scroll").length,
    ).toBe(afterFirst);

    add.mockRestore();
  });

  it("stops listening once unmounted", () => {
    placeSections({ a: 0 });

    const remove = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useActiveSection(["a"]));

    unmount();

    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));

    remove.mockRestore();
  });
});
