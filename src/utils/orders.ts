import { MenuItemType } from "@/interfaces/restaurants";
import { ORDERS } from "@/customConstants/ranking";

/**
 * The share of diners who ordered a dish, or null when too few people have
 * answered for a percentage to mean anything.
 *
 * "100% order this" from one diner is not a fact about the restaurant, it is a
 * fact about one person — a lie told with arithmetic. Mirrors the server,
 * which withholds it for the same reason.
 */
export const shareOfDiners = (
  orderCount?: number,
  dinerCount?: number,
): number | null => {
  const diners = dinerCount ?? 0;
  const orders = orderCount ?? 0;

  if (diners < ORDERS.MIN_DINERS_FOR_SHARE || diners <= 0) {
    return null;
  }

  return Math.round((orders / diners) * 100);
};

/**
 * Dishes ordered by the most people, for the "most ordered here" line.
 *
 * Popularity, not judgement — deliberately separate from the vote-based
 * ranking rather than folded into it, so neither signal hides behind the other.
 */
export const getMostOrdered = (
  items: MenuItemType[],
  size = 5,
): MenuItemType[] =>
  items
    .filter((item) => (item.order_count ?? 0) > 0)
    .sort((a, b) => (b.order_count ?? 0) - (a.order_count ?? 0))
    .slice(0, size);
