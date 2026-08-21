import { categoryLabel, humanizeSlug } from "@/utils/categoryLabel";
import { TasteCategoryType } from "@/interfaces/tastes";

const CATEGORIES: TasteCategoryType[] = [
  { slug: "dim_sum", name: "Dim Sum", kind: "food", display_order: 40 },
  { slug: "bbq", name: "BBQ", kind: "food", display_order: 70 },
  { slug: "coffee", name: "Coffee", kind: "food", display_order: 10 },
];

describe("falling back to the slug", () => {
  it("splits a multi-word slug rather than capitalising one letter", () => {
    // "Dim_sum" was showing in the heading, the filter chip and the empty
    // state, all from the same one-line helper.
    expect(humanizeSlug("dim_sum")).toBe("Dim Sum");
  });

  it("handles a hyphenated slug too", () => {
    expect(humanizeSlug("ice-cream")).toBe("Ice Cream");
  });

  it("leaves a single word alone", () => {
    expect(humanizeSlug("coffee")).toBe("Coffee");
  });

  it("does not trip over a trailing separator", () => {
    expect(humanizeSlug("dim_sum_")).toBe("Dim Sum");
  });

  it("copes with an empty slug", () => {
    expect(humanizeSlug("")).toBe("");
  });
});

describe("naming a category", () => {
  it("uses the name the server sent", () => {
    // The server holds "BBQ"; deriving it here would produce "Bbq" and the
    // same category would be called two things on two pages.
    expect(categoryLabel("bbq", CATEGORIES)).toBe("BBQ");
  });

  it("prefers the server even where the slug would humanise cleanly", () => {
    expect(categoryLabel("dim_sum", CATEGORIES)).toBe("Dim Sum");
  });

  it("falls back while the list is still loading", () => {
    expect(categoryLabel("dim_sum", [])).toBe("Dim Sum");
  });

  it("falls back for a category the server does not know", () => {
    // A slug typed into the URL by hand. It should read as a word, not crash
    // and not render blank.
    expect(categoryLabel("halal", CATEGORIES)).toBe("Halal");
  });

  it("copes with no list at all", () => {
    expect(categoryLabel("coffee")).toBe("Coffee");
  });
});
