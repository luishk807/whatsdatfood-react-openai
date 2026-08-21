import { resolveFoodCategory } from "@/utils/foodCategory";

/**
 * Which drawing a place gets.
 *
 * The bug this fixes: `cuisine` is null on most of the catalogue — the
 * classifier derives it from a menu and 6,783 of 6,786 restaurants have none —
 * so keying the icon on it alone gave crossed cutlery to nearly everything.
 * Twelve restaurants in Flushing: seven had no cuisine, including Dunkin', a
 * bagel cafe and a hot pot place.
 */
describe("structured data comes first", () => {
  it("uses the cuisine the classifier committed to", () => {
    expect(resolveFoodCategory({ name: "Wang Wang Queens", cuisine: "chinese" })).toBe(
      "chinese",
    );
  });

  it("never lets a name override a cuisine we hold", () => {
    // The classifier read a menu; the name read nothing. "China Bistro Pizza"
    // is the case `cuisines.py` warns about, and it must not become pizza.
    expect(
      resolveFoodCategory({ name: "China Bistro Pizza", cuisine: "chinese" }),
    ).toBe("chinese");
  });

  it("passes through a cuisine it has no drawing for", () => {
    // Still structured data. The icon map falls back on its own, so a new
    // cuisine on the server behaves sensibly without an edit here.
    expect(resolveFoodCategory({ name: "Somewhere", cuisine: "greek" })).toBe(
      "greek",
    );
  });

  it("normalises case and padding", () => {
    expect(resolveFoodCategory({ name: "X", cuisine: "  Korean " })).toBe("korean");
  });
});

describe("a name, only when there is nothing better", () => {
  it("reads Oh! Bagel Cafe as a cafe rather than as unknown", () => {
    // The reported case. It had no cuisine and so had crossed cutlery.
    expect(resolveFoodCategory({ name: "Oh! Bagel Cafe", cuisine: null })).toBe(
      "coffee",
    );
  });

  it("reads Dunkin' as coffee", () => {
    expect(resolveFoodCategory({ name: "Dunkin'", cuisine: null })).toBe("coffee");
    expect(resolveFoodCategory({ name: "Dunkin' Donuts", cuisine: null })).toBe(
      "coffee",
    );
  });

  it("reads a hot pot place as a hot pot place", () => {
    expect(
      resolveFoodCategory({ name: "XinLa GongFu Spicy Hot Pot", cuisine: null }),
    ).toBe("bbq");
  });

  it.each([
    ["Nan Xiang Xiao Long Bao", "dim_sum"],
    ["Ippudo Ramen", "ramen"],
    ["Joe's Pizza", "pizza"],
    ["Sushi Yasuda", "sushi"],
    ["Shake Shack Burgers", "burgers"],
    ["Los Tacos No 1", "mexican"],
    ["Brooklyn Bagels", "bakeries"],
    ["Morgenstern's Ice Cream", "desserts"],
  ])("reads %s as %s", (name, expected) => {
    expect(resolveFoodCategory({ name, cuisine: null })).toBe(expected);
  });

  it("matches on whole words only", () => {
    // "pho" must not match "phoenix", or half the catalogue becomes a noodle
    // shop.
    expect(resolveFoodCategory({ name: "Phoenix Garden", cuisine: null })).toBeNull();
  });
});

describe("what it refuses to guess", () => {
  it("returns nothing for a name that says nothing", () => {
    // The generic icon means "we do not know what this is", and it has to
    // keep meaning that — which is only true if this refuses the ambiguous
    // ones rather than reaching.
    expect(resolveFoodCategory({ name: "Rich Lucky", cuisine: null })).toBeNull();
    expect(resolveFoodCategory({ name: "Peking Empire", cuisine: null })).toBeNull();
    expect(resolveFoodCategory({ name: "Gossip House", cuisine: null })).toBeNull();
  });

  it("returns nothing when there is no name and no cuisine", () => {
    expect(resolveFoodCategory({})).toBeNull();
  });

  it("does not infer a cuisine from a name", () => {
    // It infers a shop *type*, which is a much lower bar. Nothing here turns
    // a name into a claim about what a kitchen serves.
    expect(resolveFoodCategory({ name: "Chinese Kitchen", cuisine: null })).toBeNull();
  });
});
