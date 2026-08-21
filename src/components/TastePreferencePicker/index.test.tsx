import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TastePreferencePicker from "@/components/TastePreferencePicker";
import { TASTE_LABELS } from "@/customConstants/labels";
import { TASTE_PICKER } from "@/customConstants/tastes";
import { TasteCategoryType } from "@/interfaces/tastes";

/**
 * The one picker, used on the homepage and in the account.
 *
 * What is asserted is mostly what it refuses to do: no minimum enforced, no
 * rating out of five, no emoji, nothing required. The statement being
 * collected is "I am interested in this", and it has to be answerable in the
 * time between sitting down and opening a menu.
 */
const CATEGORIES: TasteCategoryType[] = [
  { slug: "coffee", name: "Coffee", kind: "food", display_order: 10 },
  { slug: "sushi", name: "Sushi", kind: "food", display_order: 20 },
  { slug: "ramen", name: "Ramen", kind: "food", display_order: 30 },
  { slug: "chinese", name: "Chinese", kind: "cuisine", display_order: 110 },
];

const show = (
  props: Partial<Parameters<typeof TastePreferencePicker>[0]> = {},
) =>
  render(
    <TastePreferencePicker
      categories={CATEGORIES}
      selected={[]}
      onChange={jest.fn()}
      onSave={jest.fn()}
      {...props}
    />,
  );

describe("choosing", () => {
  it("offers everything the server sent", () => {
    show();

    CATEGORIES.forEach((one) => {
      expect(screen.getByRole("button", { name: one.name })).toBeInTheDocument();
    });
  });

  it("groups food separately from cuisine", () => {
    // "I like sushi" and "I am into Chinese food" are both appetites but not
    // the same claim.
    show();

    expect(screen.getByText(TASTE_LABELS.group("food"))).toBeInTheDocument();
    expect(screen.getByText(TASTE_LABELS.group("cuisine"))).toBeInTheDocument();
  });

  it("selects on the first tap", async () => {
    const onChange = jest.fn();
    show({ onChange });

    await userEvent.click(screen.getByRole("button", { name: "Coffee" }));

    expect(onChange).toHaveBeenCalledWith(["coffee"]);
  });

  it("deselects on the second", async () => {
    const onChange = jest.fn();
    show({ selected: ["coffee", "sushi"], onChange });

    await userEvent.click(screen.getByRole("button", { name: "Coffee" }));

    expect(onChange).toHaveBeenCalledWith(["sushi"]);
  });

  it("says which chips are chosen without relying on colour", () => {
    // `aria-pressed` makes the control its own state, so a screen reader
    // announces "Coffee, selected" with no extra label — and a tick carries
    // the same information for a reader the tinted ground fails.
    show({ selected: ["coffee"] });

    expect(screen.getByRole("button", { name: "Coffee" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Sushi" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("never asks anybody to rate anything", () => {
    // Initial preference is one bit: I am interested in this. A 1-5 scale
    // over fourteen categories is the questionnaire this must not become.
    const { container } = show();

    expect(container.querySelector('input[type="range"]')).toBeNull();
    expect(container.querySelector('input[type="radio"]')).toBeNull();
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it("draws icons rather than emoji", () => {
    // An emoji is a different picture on every platform, cannot take the
    // theme's colour, and cannot be replaced by our own artwork later.
    const { container } = show();

    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
    );
  });

  it("shows no national flags for a cuisine", () => {
    // Cuisine does not map cleanly onto nationality — a Chinese restaurant in
    // Flushing is a Queens restaurant — and a flag makes a claim about a
    // country where the card is about food.
    const { container } = show();

    expect(container.textContent).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]/u);
  });
});

describe("saving", () => {
  it("saves what is chosen", async () => {
    const onSave = jest.fn();
    show({ selected: ["coffee"], onSave });

    await userEvent.click(
      screen.getByRole("button", { name: TASTE_LABELS.save }),
    );

    expect(onSave).toHaveBeenCalled();
  });

  it("encourages a few without ever blocking one", async () => {
    // Advice, not a rule. Enforcing a minimum turns a two-second choice into
    // a form with a validation error.
    const onSave = jest.fn();
    show({ selected: ["coffee"], onSave });

    expect(
      screen.getByText(TASTE_LABELS.suggestion(TASTE_PICKER.SUGGESTED)),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: TASTE_LABELS.save }),
    ).toBeEnabled();

    await userEvent.click(
      screen.getByRole("button", { name: TASTE_LABELS.save }),
    );

    expect(onSave).toHaveBeenCalled();
  });

  it("lets somebody save nothing at all", () => {
    // Wanting no personalisation is a real answer and has to be recordable.
    show({ selected: [] });

    expect(
      screen.getByRole("button", { name: TASTE_LABELS.save }),
    ).toBeEnabled();
  });

  it("stops encouraging once enough are picked", () => {
    show({ selected: ["coffee", "sushi", "ramen"] });

    expect(
      screen.queryByText(TASTE_LABELS.suggestion(TASTE_PICKER.SUGGESTED)),
    ).not.toBeInTheDocument();
  });

  it("says it is working rather than going quiet", () => {
    show({ saving: true });

    expect(
      screen.getByRole("button", { name: TASTE_LABELS.saving }),
    ).toBeDisabled();
  });

  it("shows a refusal rather than failing silently", () => {
    // A save that fails quietly is indistinguishable from one that worked,
    // and the reader walks away believing something untrue.
    show({ error: "That did not save." });

    expect(screen.getByRole("alert")).toHaveTextContent("That did not save.");
  });

  it("confirms a save that worked", () => {
    show({ saved: true });

    expect(screen.getByRole("status")).toHaveTextContent(TASTE_LABELS.saved);
  });
});

describe("the two placements", () => {
  it("offers a way out of onboarding", () => {
    show({ onSkip: jest.fn(), variant: "onboarding" });

    expect(
      screen.getByRole("button", { name: TASTE_LABELS.skip }),
    ).toBeInTheDocument();
  });

  it("does not offer one in the account", () => {
    // Somebody who navigated to a settings page has already decided to be
    // there, and leaves with the back button.
    show({ onSkip: jest.fn(), variant: "manage" });

    expect(
      screen.queryByRole("button", { name: TASTE_LABELS.skip }),
    ).not.toBeInTheDocument();
  });

  it("explains what a taste is used for, in both", () => {
    // And what it is not for: choosing one must never read as publishing
    // where somebody is.
    show({ variant: "manage" });

    expect(screen.getByText(TASTE_LABELS.why)).toBeInTheDocument();
  });
});

describe("when there is nothing to offer", () => {
  it("renders nothing at all rather than an empty heading", () => {
    // An empty picker under a title looks like a section that failed to load.
    const { container } = render(
      <TastePreferencePicker
        categories={[]}
        selected={[]}
        onChange={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows placeholders while the list is arriving", () => {
    render(
      <TastePreferencePicker
        categories={[]}
        selected={[]}
        onChange={jest.fn()}
        onSave={jest.fn()}
        loading
      />,
    );

    expect(
      screen.queryByRole("button", { name: TASTE_LABELS.save }),
    ).not.toBeInTheDocument();
  });
});
