import { splitOnMatch } from "./search";

describe("splitOnMatch", () => {
  it("splits a label around what was typed", () => {
    expect(splitOnMatch("Lucali", "luc")).toEqual([
      { text: "Luc", match: true },
      { text: "ali", match: false },
    ]);
  });

  it("matches regardless of case but keeps the original text", () => {
    const [first] = splitOnMatch("Peter Luger", "PETER");

    expect(first).toEqual({ text: "Peter", match: true });
  });

  it("marks every occurrence, not just the first", () => {
    const matched = splitOnMatch("Pizza Pizza", "pizza").filter((s) => s.match);

    expect(matched).toHaveLength(2);
  });

  it("returns the whole label when nothing matches", () => {
    expect(splitOnMatch("Masa", "sushi")).toEqual([
      { text: "Masa", match: false },
    ]);
  });

  it("returns the whole label for an empty query", () => {
    expect(splitOnMatch("Masa", "   ")).toEqual([
      { text: "Masa", match: false },
    ]);
  });

  it("treats regex punctuation as text, not as a pattern", () => {
    // The previous implementation built `new RegExp("(" + query + ")")`, so a
    // single "(" threw SyntaxError and took the suggestion list down with it.
    expect(() => splitOnMatch("Joe's (Pizza)", "(")).not.toThrow();
    expect(splitOnMatch("Joe's (Pizza)", "(")).toContainEqual({
      text: "(",
      match: true,
    });
  });

  it.each(["*", "+", "?", "[", "\\", "$", "^"])(
    "survives %s in the query",
    (character) => {
      expect(() => splitOnMatch("Some Restaurant", character)).not.toThrow();
    },
  );

  it("never loses or duplicates characters", () => {
    const label = "Kowloon Cafe, Brooklyn";
    const rebuilt = splitOnMatch(label, "oo")
      .map((segment) => segment.text)
      .join("");

    expect(rebuilt).toBe(label);
  });
});
