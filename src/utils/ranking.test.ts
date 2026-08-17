import {
  getVoteCount,
  getDishAverage,
  getRestaurantMean,
  scoreDish,
  buildDishScores,
  getTopDishes,
  hasRankedDishes,
  recommendShare,
} from "@/utils/ranking";
import { RANKING } from "@/customConstants/ranking";
import { MenuItemType } from "@/interfaces/restaurants";
import { UserRating } from "@/interfaces/users";

const rating = (value: number): UserRating =>
  ({ rating: value }) as unknown as UserRating;

const dish = (
  id: number,
  name: string,
  ratings: number[] = [],
  extra: Partial<MenuItemType> = {},
): MenuItemType => ({
  id,
  name,
  description: "",
  category: "Mains",
  top_choice: false,
  ratings: ratings.map(rating),
  ...extra,
});

describe("vote counting and averages", () => {
  it("treats a dish with no ratings as zero, not NaN", () => {
    expect(getVoteCount(dish(1, "Plain"))).toBe(0);
    expect(getDishAverage(dish(1, "Plain"))).toBe(0);
  });

  it("averages the ratings it has", () => {
    expect(getDishAverage(dish(1, "Steak", [5, 4, 3]))).toBe(4);
  });
});

describe("getRestaurantMean", () => {
  it("falls back to the prior when nothing has been voted on", () => {
    const mean = getRestaurantMean([dish(1, "A"), dish(2, "B")]);
    expect(mean).toBe(RANKING.FALLBACK_MEAN);
  });

  it("weights by vote count rather than treating every dish equally", () => {
    // One dish with many low votes should drag the mean down more than a
    // single high vote pulls it up.
    const items = [dish(1, "Popular", [1, 1, 1, 1]), dish(2, "Rare", [5])];
    expect(getRestaurantMean(items)).toBeCloseTo((1 * 4 + 5) / 5, 5);
  });
});

describe("scoreDish", () => {
  it("pulls a sparsely voted dish toward the restaurant mean", () => {
    const item = dish(1, "One vote", [5]);
    const result = scoreDish(item, 3);

    // Raw average is 5, but with one vote against a prior of 8 the score sits
    // much closer to the mean of 3.
    expect(result.average).toBe(5);
    expect(result.score).toBeGreaterThan(3);
    expect(result.score).toBeLessThan(3.5);
  });

  it("converges on the dish's own average as votes accumulate", () => {
    const few = scoreDish(dish(1, "Few", [5, 5]), 3).score;
    const many = scoreDish(dish(2, "Many", Array(50).fill(5)), 3).score;

    expect(many).toBeGreaterThan(few);
    expect(many).toBeCloseTo(5, 0);
  });

  it("keeps a single high vote near the house mean instead of at its own extreme", () => {
    // Shrinkage narrows the gap; it does not by itself reverse the order. When
    // the house mean is close to the well-reviewed dish's own average, a shrunk
    // 5.0 can still edge ahead on raw score. What keeps that dish out of the
    // ranking is the vote threshold, asserted in the getTopDishes tests below.
    const items = [
      dish(1, "One perfect vote", [5]),
      dish(2, "Fifty good votes", Array(50).fill(4.6)),
    ];
    const mean = getRestaurantMean(items);
    const sparse = scoreDish(items[0], mean);

    expect(sparse.average).toBe(5);
    expect(sparse.score).toBeLessThan(4.7);
    expect(Math.abs(sparse.score - mean)).toBeLessThan(0.1);
  });

  it("does not let a lone high vote beat a well-reviewed dish at a modest house", () => {
    // The realistic case: most dishes are unremarkable, so the prior is well
    // below five and shrinkage genuinely reorders.
    const items = [
      dish(1, "One perfect vote", [5]),
      dish(2, "Fifty good votes", Array(50).fill(4.6)),
      ...Array.from({ length: 12 }, (_, index) =>
        dish(10 + index, `Ordinary ${index}`, [2, 2, 3]),
      ),
    ];
    const mean = getRestaurantMean(items);

    expect(scoreDish(items[1], mean).score).toBeGreaterThan(
      scoreDish(items[0], mean).score,
    );
  });

  it("marks a dish ranked only once it clears the vote threshold", () => {
    const under = Array(RANKING.MIN_VOTES_TO_RANK - 1).fill(4);
    const at = Array(RANKING.MIN_VOTES_TO_RANK).fill(4);

    expect(scoreDish(dish(1, "Under", under), 3).isRanked).toBe(false);
    expect(scoreDish(dish(2, "At", at), 3).isRanked).toBe(true);
  });
});

describe("buildDishScores", () => {
  it("keys by dish id and skips dishes without one", () => {
    const withoutId = {
      name: "Ghost",
      description: "",
      category: "Mains",
      top_choice: false,
    } as MenuItemType;

    const scores = buildDishScores([dish(7, "Real", [4]), withoutId]);

    expect(Object.keys(scores)).toEqual(["7"]);
    expect(scores[7].voteCount).toBe(1);
  });
});

describe("getTopDishes", () => {
  const enough = Array(RANKING.MIN_VOTES_TO_RANK).fill(5);
  const enoughButWorse = Array(RANKING.MIN_VOTES_TO_RANK).fill(2);

  it("excludes a barely-voted dish however high its score", () => {
    // This is the real guarantee behind "no confidently wrong #1 dish".
    const items = [
      dish(1, "One perfect vote", [5]),
      dish(2, "Fifty good votes", Array(50).fill(4.6)),
    ];

    expect(getTopDishes(items).map((item) => item.name)).toEqual([
      "Fifty good votes",
    ]);
  });

  it("returns only dishes with enough votes, best first", () => {
    const items = [
      dish(1, "Worse", enoughButWorse),
      dish(2, "Better", enough),
      dish(3, "Unvoted"),
    ];

    expect(getTopDishes(items).map((item) => item.name)).toEqual([
      "Better",
      "Worse",
    ]);
  });

  it("ignores the AI top_choice flag entirely", () => {
    // It used to fill the strip from this flag under the heading "Popular
    // picks · not yet voted on". A dish nobody has voted on is not a popular
    // pick, and saying so spends the credibility the real ranking needs.
    const items = [
      dish(1, "Suggested", [], { top_choice: true }),
      dish(2, "Ordinary"),
    ];

    expect(getTopDishes(items)).toEqual([]);
  });

  it("still ignores it when the flagged dish has a vote or two", () => {
    // One vote short of the threshold is still not a recommendation.
    const items = [dish(1, "Suggested", [5, 5], { top_choice: true })];

    expect(getTopDishes(items)).toEqual([]);
  });

  it("returns nothing when no dish has cleared the threshold", () => {
    expect(getTopDishes([dish(1, "A"), dish(2, "B")])).toEqual([]);
  });

  it("respects the requested size", () => {
    const items = [
      dish(1, "A", enough),
      dish(2, "B", enough),
      dish(3, "C", enough),
    ];

    expect(getTopDishes(items, 2)).toHaveLength(2);
  });
});

describe("hasRankedDishes", () => {
  it("is false until some dish clears the threshold", () => {
    expect(hasRankedDishes([dish(1, "A", [5])])).toBe(false);
    expect(
      hasRankedDishes([
        dish(1, "A", Array(RANKING.MIN_VOTES_TO_RANK).fill(5)),
      ]),
    ).toBe(true);
  });
});

describe("recommendShare", () => {
  const withVotes = (ratings: number[]) =>
    ({
      id: 1,
      name: "Plain Pie",
      ratings: ratings.map((rating, index) => ({
        id: `${index}`,
        rating,
        user_id: index + 1,
      })),
    }) as unknown as MenuItemType;

  const enough = RANKING.MIN_VOTES_TO_RANK;

  it("is the percentage who voted it up", () => {
    // 4 up, 1 down out of 5.
    expect(withVotes([5, 5, 5, 5, 1])).toBeTruthy();
    expect(recommendShare(withVotes([5, 5, 5, 5, 1]))).toBe(80);
  });

  it("is 100 when everyone recommends it", () => {
    expect(recommendShare(withVotes(Array(enough).fill(5)))).toBe(100);
  });

  it("is 0 when nobody does", () => {
    expect(recommendShare(withVotes(Array(enough).fill(1)))).toBe(0);
  });

  it("is null below the vote threshold", () => {
    // "100% recommend" from one person is the most misleading thing this
    // could say, so there is no percentage until there is a sample.
    expect(recommendShare(withVotes([5]))).toBeNull();
    expect(recommendShare(withVotes(Array(enough - 1).fill(5)))).toBeNull();
  });

  it("is null for a dish nobody has voted on", () => {
    expect(recommendShare(withVotes([]))).toBeNull();
  });

  it("rounds rather than reporting a fraction of a person", () => {
    // 2 of 6 is 33.33...
    const share = recommendShare(withVotes([5, 5, 1, 1, 1, 1]));

    expect(share).toBe(33);
    expect(Number.isInteger(share)).toBe(true);
  });

  it("survives a rating that is not a number", () => {
    const item = {
      id: 1,
      name: "Odd",
      ratings: Array.from({ length: enough }, (_, index) => ({
        id: `${index}`,
        rating: "not a number" as unknown as number,
        user_id: index,
      })),
    } as unknown as MenuItemType;

    expect(recommendShare(item)).toBe(0);
  });
});
