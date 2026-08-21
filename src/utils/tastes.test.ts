import {
  clearStoredTastes,
  groupCategories,
  orderedTastes,
  readPromptState,
  readStoredTastes,
  shouldOfferPicker,
  shouldOfferReminder,
  writePromptState,
  writeStoredTastes,
} from "@/utils/tastes";
import {
  TASTE_PICKER,
  TASTE_PROMPT,
  TASTE_STORAGE_KEY,
} from "@/customConstants/tastes";
import { TasteCategoryType } from "@/interfaces/tastes";

const category = (
  slug: string,
  kind: string,
  order: number,
): TasteCategoryType => ({ slug, name: slug, kind, display_order: order });

const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  window.localStorage.clear();
});

describe("a guest's choices", () => {
  it("survive a reload", () => {
    // The whole reason this is not gated on an account. Requiring one to say
    // "I like coffee" is the sign-up wall the feature exists to avoid.
    writeStoredTastes(["coffee", "sushi"]);

    expect(readStoredTastes()).toEqual(["coffee", "sushi"]);
  });

  it("are absent rather than broken when nothing was stored", () => {
    expect(readStoredTastes()).toEqual([]);
  });

  it("are absent rather than trusted when the stored value is nonsense", () => {
    // Malformed JSON reads as "no preferences", never as a filter that then
    // returns nothing and looks like an empty catalogue.
    window.localStorage.setItem(TASTE_STORAGE_KEY, "{not json");

    expect(readStoredTastes()).toEqual([]);
  });

  it("drop anything that is not a slug", () => {
    window.localStorage.setItem(
      TASTE_STORAGE_KEY,
      JSON.stringify(["coffee", 7, null, { slug: "sushi" }]),
    );

    expect(readStoredTastes()).toEqual(["coffee"]);
  });

  it("are cleared once merged into an account", () => {
    // Left behind, they would resurrect on the next sign-in a taste the
    // person had since removed from their account.
    writeStoredTastes(["coffee"]);
    clearStoredTastes();

    expect(readStoredTastes()).toEqual([]);
  });
});

describe("how often we may ask", () => {
  const state = (over: Partial<ReturnType<typeof readPromptState>> = {}) => ({
    state: TASTE_PROMPT.unanswered,
    at: 0,
    ...over,
  });

  it("does not ask before there is anywhere to apply the answer", () => {
    // "Coffee near you" is a promise the page cannot keep without a location,
    // and asking first is asking before the reader has seen what it buys them.
    expect(shouldOfferPicker(state(), false, false)).toBe(false);
  });

  it("asks once there is a location and no answer yet", () => {
    expect(shouldOfferPicker(state(), true, false)).toBe(true);
  });

  it("never asks somebody who has already answered", () => {
    expect(
      shouldOfferPicker(state({ state: TASTE_PROMPT.saved }), true, true),
    ).toBe(false);
  });

  it("never asks somebody who already has preferences", () => {
    // Belt and braces: the stored flag and the actual data both have to say
    // there is nothing, so a cleared flag cannot re-open the card on somebody
    // whose account is full of tastes.
    expect(shouldOfferPicker(state(), true, true)).toBe(false);
  });

  it("does not ask again next week after a skip", () => {
    // A card that reappears every visit is nagging, and nagging is how an
    // optional feature makes an application feel like a form.
    const skipped = state({ state: TASTE_PROMPT.dismissed, at: Date.now() });

    expect(shouldOfferPicker(skipped, true, false)).toBe(false);
  });

  it("offers the quiet line instead, for somebody who skipped", () => {
    const skipped = state({ state: TASTE_PROMPT.dismissed, at: Date.now() });

    expect(shouldOfferReminder(skipped, true, false)).toBe(true);
  });

  it("asks again after a month, because taste changes", () => {
    const long = Date.now() - (TASTE_PICKER.RESURFACE_AFTER_DAYS + 1) * DAY;
    const skipped = state({ state: TASTE_PROMPT.dismissed, at: long });

    expect(shouldOfferPicker(skipped, true, false)).toBe(true);
  });

  it("never shows the card and the reminder at once", () => {
    const fresh = state();

    expect(
      shouldOfferPicker(fresh, true, false) &&
        shouldOfferReminder(fresh, true, false),
    ).toBe(false);
  });

  it("says nothing at all to somebody who has answered", () => {
    const done = state({ state: TASTE_PROMPT.saved });

    expect(shouldOfferPicker(done, true, true)).toBe(false);
    expect(shouldOfferReminder(done, true, true)).toBe(false);
  });

  it("remembers a skip across a reload", () => {
    writePromptState(TASTE_PROMPT.dismissed);

    expect(readPromptState().state).toBe(TASTE_PROMPT.dismissed);
  });

  it("treats a corrupted flag as never having asked", () => {
    window.localStorage.setItem("wdf.tastes.prompt", "nonsense");

    expect(readPromptState().state).toBe(TASTE_PROMPT.unanswered);
  });
});

describe("grouping what the picker offers", () => {
  it("keeps the server's order", () => {
    // The server decides what exists and in what sequence; a copy of that
    // list in the browser is a second source of truth.
    const groups = groupCategories([
      category("chinese", "cuisine", 110),
      category("coffee", "food", 10),
      category("sushi", "food", 20),
    ]);

    expect(groups.map((one) => one.kind)).toEqual(["food", "cuisine"]);
    expect(groups[0].categories.map((one) => one.slug)).toEqual([
      "coffee",
      "sushi",
    ]);
  });

  it("gives a kind it has never heard of its own group", () => {
    // The server is allowed to invent one, and a category that silently fails
    // to render is worse than an unstyled heading.
    const groups = groupCategories([
      category("coffee", "food", 10),
      category("halal", "dietary", 200),
    ]);

    expect(groups.map((one) => one.kind)).toContain("dietary");
  });

  it("handles an empty list", () => {
    expect(groupCategories([])).toEqual([]);
  });
});

describe("which tastes build the homepage", () => {
  it("puts what somebody said ahead of what we guessed", () => {
    // An explicit choice is the person's own statement about themselves. An
    // inference is ours about them, and it queues behind.
    const ordered = orderedTastes([
      { slug: "ramen", name: "Ramen", kind: "food", source: "inferred" },
      { slug: "coffee", name: "Coffee", kind: "food", source: "explicit" },
    ]);

    expect(ordered.map((one) => one.slug)).toEqual(["coffee", "ramen"]);
  });
});
