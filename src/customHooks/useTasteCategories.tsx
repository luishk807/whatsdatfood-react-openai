import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import _get from "lodash/get";
import { TASTE_CATEGORIES } from "@/graphql/queries/tastes";
import { TasteCategoryType } from "@/interfaces/tastes";

/**
 * The category list on its own, for a page that needs the names and nothing
 * else.
 *
 * `useTastePreferences` also exposes these, and mounting it for a label would
 * bring what a page like `/nearby` has no business running: a signed-in
 * preferences query and the merge-on-sign-in effect, whose guard is a ref on
 * one instance. A second component owning that effect is how a guest's stored
 * tastes get merged twice.
 *
 * **Free, and shared.** Seventeen rows, cache-first, and the same Apollo cache
 * entry the picker and the homepage already fill — so a reader arriving at
 * `/nearby` from the homepage shortcut makes no request at all.
 */
const useTasteCategories = (): {
  categories: TasteCategoryType[];
  loading: boolean;
} => {
  const { data, loading } = useQuery(TASTE_CATEGORIES, {
    fetchPolicy: "cache-first",
  });

  const categories = useMemo(
    () => _get<TasteCategoryType[]>(data, "tasteCategories", []) ?? [],
    [data],
  );

  return { categories, loading };
};

export default useTasteCategories;
