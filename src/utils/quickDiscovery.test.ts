import {
  isPersonalised,
  quickCategories,
  remainingCategories,
} from "@/utils/quickDiscovery";
import { TasteCategoryType, TastePreferenceType } from "@/interfaces/tastes";

const category = (
  slug: string,
  order: number,
  kind = "food",
): TasteCategoryType => ({ slug, name: slug, kind, display_order: order });

const CATEGORIES: TasteCategoryType[] = [
  category("coffee", 10),
  category("sushi", 20),
  category("ramen", 30),
  category("dim_sum", 40),
  category("pizza", 50),
  category("chinese", 110, "cuisine"),
  category("korean", 140, "cuisine"),
];

const prefers = (...slugs: string[]): TastePreferenceType[] =>
  slugs.map((slug) => ({ slug, name: slug, kind: "food", source: "explicit" }));

describe("what goes on the shortcut row", () => {
  it("shows sensible defaults for somebody with no preferences", () => {
    // The server's own display order, not a second "popular" list that would
    // drift from the picker.
    const shown = quickCategories([], CATEGORIES);

    expect(shown.map((one) => one.slug)).toEqual([
      "coffee",
      "sushi",
      "ramen",
      "dim_sum",
    ]);
  });

  it("leads with what somebody said they like", () => {
    const shown = quickCategories(prefers("korean", "pizza"), CATEGORIES);

    expect(shown.slice(0, 2).map((one) => one.slug)).toEqual([
      "korean",
      "pizza",
    ]);
  });

  it("fills the rest of the row rather than showing only preferences", () => {
    // Somebody who saved one taste still gets four shortcuts. A row of one is
    // a worse front door than a row of four.
    const shown = quickCategories(prefers("korean"), CATEGORIES);

    expect(shown).toHaveLength(4);
    expect(shown[0].slug).toBe("korean");
  });

  it("never repeats a category", () => {
    const shown = quickCategories(prefers("coffee", "sushi"), CATEGORIES);

    expect(new Set(shown.map((one) => one.slug)).size).toBe(shown.length);
  });

  it("ignores a preference the server no longer offers", () => {
    // A retired category stays true about the person and has no business
    // being a shortcut to a filter that would return nothing.
    const shown = quickCategories(prefers("halal", "coffee"), CATEGORIES);

    expect(shown.map((one) => one.slug)).not.toContain("halal");
    expect(shown[0].slug).toBe("coffee");
  });

  it("copes with an empty catalogue", () => {
    expect(quickCategories(prefers("coffee"), [])).toEqual([]);
  });
});

describe("everything else stays one tap away", () => {
  it("puts the categories not shown behind More", () => {
    // The reason personalising the visible four is safe: nothing is removed,
    // it is only reordered.
    const shown = quickCategories(prefers("korean"), CATEGORIES);
    const rest = remainingCategories(shown, CATEGORIES);

    expect(rest.length).toBe(CATEGORIES.length - shown.length);
    expect([...shown, ...rest].map((one) => one.slug).sort()).toEqual(
      CATEGORIES.map((one) => one.slug).sort(),
    );
  });

  it("holds them in the server's order rather than the personalised one", () => {
    const shown = quickCategories(prefers("korean"), CATEGORIES);
    const rest = remainingCategories(shown, CATEGORIES);
    const orders = rest.map((one) => one.display_order ?? 0);

    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });

  it("is empty only when everything is already shown", () => {
    const shown = quickCategories([], CATEGORIES, CATEGORIES.length);

    expect(remainingCategories(shown, CATEGORIES)).toEqual([]);
  });
});

describe("saying when the row is personalised", () => {
  it("is personalised when a saved taste is on it", () => {
    expect(isPersonalised(prefers("korean"), CATEGORIES)).toBe(true);
  });

  it("is not personalised with no preferences", () => {
    // A reader should be able to tell why they are shown these four rather
    // than four others.
    expect(isPersonalised([], CATEGORIES)).toBe(false);
  });

  it("is not personalised when every saved taste has been retired", () => {
    expect(isPersonalised(prefers("halal"), CATEGORIES)).toBe(false);
  });
});
