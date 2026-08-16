import { MenuItemType } from "@/interfaces/restaurants";
import { DishScore, DishScoreMap } from "@/interfaces/ranking";
import { RANKING } from "@/customConstants/ranking";

export const getVoteCount = (item: MenuItemType): number =>
  item.ratings?.length ?? 0;

export const getDishAverage = (item: MenuItemType): number => {
  const ratings = item.ratings ?? [];

  if (!ratings.length) {
    return 0;
  }

  const total = ratings.reduce(
    (sum, rating) => sum + Number(rating?.rating ?? 0),
    0,
  );

  return total / ratings.length;
};

/**
 * The prior every dish is pulled toward: this restaurant's own vote-weighted
 * mean, so a cheap dish is not punished for being in an expensive place.
 */
export const getRestaurantMean = (items: MenuItemType[]): number => {
  const totals = items.reduce(
    (acc, item) => {
      const votes = getVoteCount(item);

      if (!votes) {
        return acc;
      }

      return {
        weighted: acc.weighted + getDishAverage(item) * votes,
        votes: acc.votes + votes,
      };
    },
    { weighted: 0, votes: 0 },
  );

  return totals.votes ? totals.weighted / totals.votes : RANKING.FALLBACK_MEAN;
};

/**
 * score = (v/(v+m))·R + (m/(v+m))·C
 *
 * With few votes the score sits near the restaurant mean C; as votes accumulate
 * it converges on the dish's own mean R. Without this a single five-star vote
 * would outrank a dish with fifty good ones.
 */
export const scoreDish = (
  item: MenuItemType,
  restaurantMean: number,
): DishScore => {
  const voteCount = getVoteCount(item);
  const average = getDishAverage(item);
  const prior = RANKING.PRIOR_WEIGHT;

  const score = voteCount
    ? (voteCount / (voteCount + prior)) * average +
      (prior / (voteCount + prior)) * restaurantMean
    : restaurantMean;

  return {
    id: Number(item.id ?? 0),
    score,
    average,
    voteCount,
    isRanked: voteCount >= RANKING.MIN_VOTES_TO_RANK,
  };
};

export const buildDishScores = (items: MenuItemType[]): DishScoreMap => {
  const restaurantMean = getRestaurantMean(items);

  return items.reduce<DishScoreMap>((acc, item) => {
    if (item?.id === undefined || item?.id === null) {
      return acc;
    }

    acc[Number(item.id)] = scoreDish(item, restaurantMean);
    return acc;
  }, {});
};

/**
 * Dishes for the "most loved here" strip. Only dishes with enough votes to be
 * ranked honestly qualify; when none do we fall back to the AI's top_choice
 * flag, which the UI labels as unverified so it never reads as a real ranking.
 */
export const getTopDishes = (
  items: MenuItemType[],
  size: number = RANKING.TOP_STRIP_SIZE,
): MenuItemType[] => {
  const restaurantMean = getRestaurantMean(items);

  const ranked = items
    .filter((item) => getVoteCount(item) >= RANKING.MIN_VOTES_TO_RANK)
    .sort(
      (a, b) =>
        scoreDish(b, restaurantMean).score - scoreDish(a, restaurantMean).score,
    );

  if (ranked.length) {
    return ranked.slice(0, size);
  }

  return items.filter((item) => item.top_choice).slice(0, size);
};

/** True once any dish has cleared the vote threshold. */
export const hasRankedDishes = (items: MenuItemType[]): boolean =>
  items.some((item) => getVoteCount(item) >= RANKING.MIN_VOTES_TO_RANK);
