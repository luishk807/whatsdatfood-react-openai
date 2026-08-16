import { useMemo } from "react";
import { MenuItemType } from "@/interfaces/restaurants";
import {
  buildDishScores,
  getTopDishes,
  hasRankedDishes,
} from "@/utils/ranking";
import { RANKING } from "@/customConstants/ranking";

/**
 * Ranking runs on the menu payload the page already has — the slug query
 * returns each dish's ratings nested — so no extra request is made.
 */
const useDishRanking = (
  items: MenuItemType[],
  topSize: number = RANKING.TOP_STRIP_SIZE,
) => {
  const scores = useMemo(() => buildDishScores(items), [items]);

  const topDishes = useMemo(
    () => getTopDishes(items, topSize),
    [items, topSize],
  );

  const isRanked = useMemo(() => hasRankedDishes(items), [items]);

  return {
    scores,
    topDishes,
    /** False while the strip is showing AI suggestions rather than real votes. */
    isRanked,
  };
};

export default useDishRanking;
