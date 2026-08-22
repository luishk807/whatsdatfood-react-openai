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

  it("tells a waiting reader they do not have to sit here", () => {
    // The work is on a background thread and outlives this page. Saying so
    // is the difference between waiting and being trapped.
    render(<MenuStatusPanel state="pending" />);

    expect(
      screen.getByText(MENU_STATUS_LABELS.keepBrowsing),
    ).toBeInTheDocument();
  });

  it("shows something visibly working, not a two-pixel dot", () => {
    // The reported problem. A faint pulse in an otherwise empty panel reads
    // as content that failed to arrive - and on a catalogue where most
    // restaurants have no menu, that is the worst impression to give.
    render(<MenuStatusPanel state="pending" />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("claims no percentage it does not have", () => {
    // The backend does not know how far through a menu extraction is - it is
    // batches against a model, not a file upload. A number here would be
    // invented, and a progress bar that lies is worse than none.
    render(<MenuStatusPanel state="pending" />);

    const bar = screen.getByRole("progressbar");

    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar.textContent).toBe("");
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
    render(<MenuStatusPanel state="unavailable" retryable onRetry={onRetry} />);

    expect(
      screen.getByRole("button", { name: MENU_STATUS_LABELS.retry }),
    ).toBeInTheDocument();
  });

  it("asks again when that is pressed", async () => {
    const onRetry = jest.fn();
    render(<MenuStatusPanel state="unavailable" retryable onRetry={onRetry} />);

    await userEvent.click(screen.getByRole("button", { name: MENU_STATUS_LABELS.retry }));

    expect(onRetry).toHaveBeenCalled();
  });

  it("does not show a waiting animation once it has given up", () => {
    render(<MenuStatusPanel state="unavailable" />);

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("offers no retry to a restaurant that has used up its attempts", () => {
    // A button that spends money to fail a fourth time is worse than no
    // button. The server decides - a copy of that rule here is a second
    // source of truth and the one that goes stale.
    const onRetry = jest.fn();
    render(<MenuStatusPanel state="unavailable" onRetry={onRetry} />);

    expect(
      screen.queryByRole("button", { name: MENU_STATUS_LABELS.retry }),
    ).not.toBeInTheDocument();
  });

  it("still points somewhere useful when it has given up", () => {
    // Nothing is coming, but the reader is sitting in the restaurant and can
    // add a dish themselves. A dead end with no next move is what makes an
    // empty page feel broken.
    render(<MenuStatusPanel state="unavailable" />);

    expect(
      screen.getByText(MENU_STATUS_LABELS.exhaustedBody),
    ).toBeInTheDocument();
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
