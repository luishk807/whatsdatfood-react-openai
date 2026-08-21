import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenuStatusPanel from "@/components/MenuStatusPanel";
import { MENU_STATUS_LABELS } from "@/customConstants/labels";

/**
 * What sits where the menu goes before there is one.
 *
 * The load-bearing assertions are about what this never does: it never names a
 * mechanism, it never leaves somebody on an endless wait with no way out, and
 * it disappears entirely the moment there is food to show.
 */
describe("while the menu is being prepared", () => {
  it("says what is happening in the first few seconds", () => {
    render(<MenuStatusPanel state="pending" />);

    expect(screen.getByText(MENU_STATUS_LABELS.pendingTitle)).toBeInTheDocument();
    expect(screen.getByText(MENU_STATUS_LABELS.pendingBody)).toBeInTheDocument();
  });

  it("changes what it says once that stops being honest", () => {
    // "This may take a few seconds" is false at thirty seconds, and a reader
    // who has been told it twice stops believing the next thing too.
    render(<MenuStatusPanel state="pending" slow />);

    expect(screen.getByText(MENU_STATUS_LABELS.slowTitle)).toBeInTheDocument();
    expect(screen.getByText(MENU_STATUS_LABELS.slowBody)).toBeInTheDocument();
  });

  it("tells a waiting reader the rest of the page works", () => {
    render(<MenuStatusPanel state="pending" slow />);

    expect(screen.getByText(/browse the restaurant now/i)).toBeInTheDocument();
  });

  it("is announced, because the wording changes under the reader", () => {
    render(<MenuStatusPanel state="pending" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("when there will not be a menu", () => {
  it("says so plainly rather than waiting forever", () => {
    render(<MenuStatusPanel state="unavailable" />);

    expect(screen.getByText(MENU_STATUS_LABELS.failedTitle)).toBeInTheDocument();
  });

  it("offers a way to ask again", () => {
    const onRetry = jest.fn();
    render(<MenuStatusPanel state="unavailable" onRetry={onRetry} />);

    expect(
      screen.getByRole("button", { name: MENU_STATUS_LABELS.retry }),
    ).toBeInTheDocument();
  });

  it("asks again when that is pressed", async () => {
    const onRetry = jest.fn();
    render(<MenuStatusPanel state="unavailable" onRetry={onRetry} />);

    await userEvent.click(screen.getByRole("button", { name: MENU_STATUS_LABELS.retry }));

    expect(onRetry).toHaveBeenCalled();
  });

  it("does not show a waiting animation once it has given up", () => {
    const { container } = render(<MenuStatusPanel state="unavailable" />);

    expect(container.querySelector(".animate-pulse")).toBeNull();
  });
});

describe("what it never does", () => {
  it("renders nothing at all once there are dishes", () => {
    // The menu is the page. A panel above it explaining that the menu exists
    // is noise on every restaurant that works.
    const { container } = render(<MenuStatusPanel state="ready" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing before the first answer", () => {
    const { container } = render(<MenuStatusPanel />);

    expect(container).toBeEmptyDOMElement();
  });

  it("never names a mechanism", () => {
    // Somebody at a table wants to know whether food is about to appear.
    // "extraction", "OpenAI" and "enrichment" are our vocabulary, and a
    // sentence carrying one reads as an excuse rather than an answer.
    const words = [
      "openai",
      "ai",
      "extraction",
      "extract",
      "enrichment",
      "api",
      "job",
      "queue",
      "database",
      "cache",
      "overpass",
    ];

    const copy = Object.values(MENU_STATUS_LABELS).join(" ").toLowerCase();

    for (const word of words) {
      expect(copy).not.toMatch(new RegExp(`\\b${word}\\b`));
    }
  });
});
