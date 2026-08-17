import { renderHook } from "@testing-library/react";
import useDishRanking from "@/customHooks/useDishRanking";
import { RANKING } from "@/customConstants/ranking";
import { MenuItemType } from "@/interfaces/restaurants";

const dish = (
  id: number,
  ratings: number[],
  extra: Partial<MenuItemType> = {},
): MenuItemType =>
  ({
    id,
    name: `Dish ${id}`,
    ratings: ratings.map((rating, index) => ({
      id: `${id}-${index}`,
      rating,
      user_id: index + 1,
    })),
    ...extra,
  }) as MenuItemType;

const voted = (id: number, count: number, rating = 5) =>
  dish(id, Array.from({ length: count }, () => rating));

describe("useDishRanking", () => {
  it("scores every dish it is given", () => {
    const items = [voted(1, 10), voted(2, 10, 1)];
    const { result } = renderHook(() => useDishRanking(items));

    expect(Object.keys(result.current.scores)).toHaveLength(2);
    expect(result.current.scores[1].voteCount).toBe(10);
  });

  it("withholds a rank below the vote threshold", () => {
    // A wrong "top dish" costs more trust than saying nothing, so a barely
    // voted dish shows its count and never a rank.
    const items = [voted(1, RANKING.MIN_VOTES_TO_RANK - 1)];
    const { result } = renderHook(() => useDishRanking(items));

    expect(result.current.scores[1].isRanked).toBe(false);
    expect(result.current.isRanked).toBe(false);
  });

  it("ranks once the threshold is met", () => {
    const items = [voted(1, RANKING.MIN_VOTES_TO_RANK)];
    const { result } = renderHook(() => useDishRanking(items));

    expect(result.current.scores[1].isRanked).toBe(true);
    expect(result.current.isRanked).toBe(true);
  });

  it("caps the strip", () => {
    const items = Array.from({ length: 12 }, (_, i) => voted(i + 1, 10));
    const { result } = renderHook(() => useDishRanking(items));

    expect(result.current.topDishes.length).toBeLessThanOrEqual(
      RANKING.TOP_STRIP_SIZE,
    );
  });

  it("honours a caller's strip size", () => {
    const items = Array.from({ length: 12 }, (_, i) => voted(i + 1, 10));
    const { result } = renderHook(() => useDishRanking(items, 3));

    expect(result.current.topDishes).toHaveLength(3);
  });

  it("puts the better-rated dish first once both are ranked", () => {
    const items = [
      voted(1, RANKING.MIN_VOTES_TO_RANK, 1),
      voted(2, RANKING.MIN_VOTES_TO_RANK, 5),
    ];
    const { result } = renderHook(() => useDishRanking(items));

    expect(Number(result.current.topDishes[0].id)).toBe(2);
  });

  it("copes with an empty menu", () => {
    const { result } = renderHook(() => useDishRanking([]));

    expect(result.current.scores).toEqual({});
    expect(result.current.topDishes).toEqual([]);
    expect(result.current.isRanked).toBe(false);
  });

  it("copes with a dish nobody has voted on", () => {
    const { result } = renderHook(() => useDishRanking([dish(1, [])]));

    expect(result.current.scores[1].voteCount).toBe(0);
    expect(result.current.scores[1].isRanked).toBe(false);
  });

  it("does not recompute when given the same array", () => {
    const items = [voted(1, 10)];
    const { result, rerender } = renderHook(() => useDishRanking(items));
    const first = result.current.scores;

    rerender();

    // Ranking runs on every render otherwise, on every menu, for nothing.
    expect(result.current.scores).toBe(first);
  });
});
