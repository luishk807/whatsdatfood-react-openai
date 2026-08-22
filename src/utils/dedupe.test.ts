import { withoutSeen } from "@/utils/dedupe";

/**
 * Keeping one restaurant out of two sections at once.
 *
 * The interesting cases are the ones where deduplication is refused. On a
 * catalogue this size the same handful of restaurants can answer several
 * questions, and a section stripped to nothing to avoid repeating one of them
 * costs the reader a real recommendation for a cosmetic gain.
 */
const places = (...ids: string[]) => ids.map((id) => ({ id }));

describe("cross-section deduplication", () => {
  it("drops what a higher section already showed", () => {
    const kept = withoutSeen(places("a", "b", "c", "d"), ["a"], 2);

    expect(kept.map((one) => one.id)).toEqual(["b", "c", "d"]);
  });

  it("changes nothing when the sections do not overlap", () => {
    const kept = withoutSeen(places("a", "b", "c"), ["x", "y"], 2);

    expect(kept.map((one) => one.id)).toEqual(["a", "b", "c"]);
  });

  it("changes nothing when nothing has been shown yet", () => {
    // The first section on the page has no reason to filter itself.
    const kept = withoutSeen(places("a", "b"), [], 2);

    expect(kept.map((one) => one.id)).toEqual(["a", "b"]);
  });

  it("keeps the row intact rather than leaving it thin", () => {
    // Relevance beats tidiness. Two weak results is worse than repeating
    // something from the section above.
    const kept = withoutSeen(places("a", "b", "c"), ["a", "b"], 3);

    expect(kept.map((one) => one.id)).toEqual(["a", "b", "c"]);
  });

  it("keeps the row intact rather than emptying it", () => {
    // A heading over nothing makes the catalogue look broken rather than
    // uneven, which is the impression this page can least afford.
    const kept = withoutSeen(places("a", "b"), ["a", "b"], 2);

    expect(kept.map((one) => one.id)).toEqual(["a", "b"]);
  });

  it("refuses to reduce a section to a single card", () => {
    // A one-card row is the thin row the floor exists to prevent, whether it
    // got there from three results or from two.
    const kept = withoutSeen(places("a", "b"), ["a"], 3);

    expect(kept.map((one) => one.id)).toEqual(["a", "b"]);
  });

  it("filters as soon as enough survive", () => {
    const kept = withoutSeen(places("a", "b", "c", "d"), ["a"], 3);

    expect(kept.map((one) => one.id)).toEqual(["b", "c", "d"]);
  });

  it("leaves the input alone", () => {
    const original = places("a", "b");

    withoutSeen(original, ["a"], 1);

    expect(original.map((one) => one.id)).toEqual(["a", "b"]);
  });
});
