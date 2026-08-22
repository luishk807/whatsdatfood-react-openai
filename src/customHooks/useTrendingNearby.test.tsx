import { tasteArgument } from "@/customHooks/useTrendingNearby";

/**
 * What the homepage sends when it asks what is popular nearby.
 *
 * The boost itself is the server's decision — the threshold, the weighting and
 * whether a preference lifts anything are all rules about our data. This is
 * only the argument, and the two things worth pinning are that a guest's
 * tastes travel at all and that asking twice costs once.
 */
describe("the tastes argument", () => {
  it("carries a guest's tastes, because the server has never seen them", () => {
    // They live in localStorage. Without this a guest gets no boost at all,
    // and they are the one reader for whom it cannot happen any other way.
    expect(tasteArgument(["sushi", "coffee"])).toEqual(["coffee", "sushi"]);
  });

  it("sorts them, so one answer serves both orders", () => {
    // Two readers with the same preferences in a different order would
    // otherwise be two cache entries for one answer.
    expect(tasteArgument(["sushi", "coffee"])).toEqual(
      tasteArgument(["coffee", "sushi"]),
    );
  });

  it("sends nothing rather than an empty list", () => {
    // An empty array is a value the cache keys on, and it means the same as
    // not asking.
    expect(tasteArgument([])).toBeUndefined();
    expect(tasteArgument(undefined)).toBeUndefined();
  });

  it("does not mutate what it was given", () => {
    const saved = ["sushi", "coffee"];

    tasteArgument(saved);

    expect(saved).toEqual(["sushi", "coffee"]);
  });
});
