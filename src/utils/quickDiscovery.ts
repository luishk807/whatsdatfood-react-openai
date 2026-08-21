import { QUICK_DISCOVERY } from "@/customConstants/tastes";
import { TasteCategoryType, TastePreferenceType } from "@/interfaces/tastes";

/**
 * Which shortcuts sit under the search box.
 *
 * The homepage answers "I know the restaurant" well and answered "I want
 * coffee and I do not know a single coffee shop" not at all — the only way to
 * browse by category was a cuisine tile at the very bottom of the page.
 *
 * **Saved tastes order these; they never filter anything.** That distinction
 * is the whole design. A preference decides which four shortcuts a person is
 * offered, and nothing else: nearby discovery still contains every restaurant,
 * and the categories somebody did not choose are still one tap away behind
 * "More". A preference that quietly removed Italian from the map would turn
 * personalisation into a bubble, and the reader would have no way to know it
 * had happened.
 *
 * **The list itself is the server's.** `tasteCategories` is the same table the
 * picker renders, so there is one taxonomy — no second list of "popular
 * categories" to drift from it. Somebody with no preferences gets the first
 * few in the server's own display order, which is what "sensible defaults"
 * means without inventing a parallel ranking.
 */
export const quickCategories = (
  preferences: TastePreferenceType[],
  categories: TasteCategoryType[],
  limit: number = QUICK_DISCOVERY.SHOWN,
): TasteCategoryType[] => {
  const known = new Map(categories.map((one) => [one.slug, one]));

  // What they said they like, in the order they hold it, and only where the
  // server still offers it — a retired category stays true about somebody and
  // has no business being a shortcut.
  const chosen = preferences
    .map((one) => known.get(one.slug))
    .filter((one): one is TasteCategoryType => Boolean(one));

  const rest = [...categories]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .filter((one) => !chosen.some((pick) => pick.slug === one.slug));

  return [...chosen, ...rest].slice(0, limit);
};

/**
 * Everything not already on the row, for the "More" sheet.
 *
 * The point of More is that browsing outside your own tastes is always one
 * tap away. It is never empty when there are categories left, and it holds
 * them in the server's order rather than repeating the personalised one.
 */
export const remainingCategories = (
  shown: TasteCategoryType[],
  categories: TasteCategoryType[],
): TasteCategoryType[] =>
  [...categories]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .filter((one) => !shown.some((pick) => pick.slug === one.slug));

/**
 * Whether this row is personalised, for the caption that says so.
 *
 * A reader should always be able to tell why they are being shown these four
 * rather than four others — that is the difference between personalisation
 * and the product quietly deciding for them.
 */
export const isPersonalised = (
  preferences: TastePreferenceType[],
  categories: TasteCategoryType[],
): boolean =>
  preferences.some((one) => categories.some((c) => c.slug === one.slug));
