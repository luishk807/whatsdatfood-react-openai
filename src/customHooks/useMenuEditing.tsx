import { useCallback, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ARCHIVE_DISH,
  DECIDE_DISH_SUBMISSION,
  MARK_MENU_VERIFIED,
  OWNER_MENU,
  PENDING_DISH_SUBMISSIONS,
  RENAME_MENU_CATEGORY,
  REORDER_DISHES,
  RESTORE_DISH,
  SAVE_MENU_CATEGORIES,
  SET_DISH_AVAILABILITY,
  SUBMIT_DISH,
} from "@/graphql/queries/menu";
import {
  ManagedDishType,
  MenuCategoryType,
  OwnerMenuType,
  SubmitDishInput,
} from "@/interfaces/menu";
import { _get } from "@/utils";

/**
 * Adding a dish, and everything an owner does to a menu.
 *
 * **Server refusals are surfaced verbatim.** Every one of them explains a
 * rule — that dish is already on the menu, you have several still waiting to
 * be checked, a price cannot be negative — and rewording them here would turn
 * an explanation into "that did not work".
 *
 * **The queues are `network-only`.** They are work lists, and a cached one
 * shows a row somebody else has already dealt with. The owner's menu is too:
 * an owner who just changed a price and sees the old one assumes it failed
 * and changes it again.
 */
const useMenuEditing = () => {
  const [error, setError] = useState<string | null>(null);

  const [submitMutation] = useMutation(SUBMIT_DISH);
  const [decideMutation] = useMutation(DECIDE_DISH_SUBMISSION);
  const [availabilityMutation] = useMutation(SET_DISH_AVAILABILITY);
  const [archiveMutation] = useMutation(ARCHIVE_DISH);
  const [restoreMutation] = useMutation(RESTORE_DISH);
  const [saveCategoriesMutation] = useMutation(SAVE_MENU_CATEGORIES);
  const [renameCategoryMutation] = useMutation(RENAME_MENU_CATEGORY);
  const [reorderMutation] = useMutation(REORDER_DISHES);
  const [verifyMutation] = useMutation(MARK_MENU_VERIFIED);

  const [fetchOwnerMenu, { loading: menuLoading }] = useLazyQuery(OWNER_MENU, {
    fetchPolicy: "network-only",
  });
  const [fetchPending, { loading: pendingLoading }] = useLazyQuery(
    PENDING_DISH_SUBMISSIONS,
    { fetchPolicy: "network-only" },
  );

  /** One place to unwrap a GraphQL failure into the sentence the server sent. */
  const failed = useCallback((thrown: unknown, fallback: string) => {
    setError(thrown instanceof Error ? thrown.message : fallback);
    return null;
  }, []);

  const submitDish = useCallback(
    async (input: SubmitDishInput): Promise<ManagedDishType | null> => {
      setError(null);

      try {
        const resp = await submitMutation({ variables: { input } });
        return _get<ManagedDishType | null>(resp, "data.submitDish", null);
      } catch (thrown) {
        return failed(thrown, "That dish could not be added.");
      }
    },
    [submitMutation, failed],
  );

  const loadOwnerMenu = useCallback(
    async (slug: string): Promise<OwnerMenuType | null> => {
      setError(null);

      try {
        const resp = await fetchOwnerMenu({ variables: { slug } });
        return _get<OwnerMenuType | null>(resp, "data.ownerMenu", null);
      } catch (thrown) {
        return failed(thrown, "That menu could not be loaded.");
      }
    },
    [fetchOwnerMenu, failed],
  );

  const loadPendingDishes = useCallback(async (): Promise<ManagedDishType[]> => {
    const resp = await fetchPending({ variables: { page: 1, limit: 25 } });

    return (
      _get<ManagedDishType[]>(resp, "data.pendingDishSubmissions.data", []) ?? []
    );
  }, [fetchPending]);

  const decideDish = useCallback(
    async (dishId: string, approve: boolean, note?: string) => {
      await decideMutation({ variables: { dishId, approve, note } });
    },
    [decideMutation],
  );

  const setAvailability = useCallback(
    async (dishId: string, available: boolean) => {
      setError(null);

      try {
        await availabilityMutation({ variables: { dishId, available } });
        return true;
      } catch (thrown) {
        failed(thrown, "That could not be changed.");
        return false;
      }
    },
    [availabilityMutation, failed],
  );

  const archiveDish = useCallback(
    async (dishId: string) => {
      await archiveMutation({ variables: { dishId } });
    },
    [archiveMutation],
  );

  const restoreDish = useCallback(
    async (dishId: string) => {
      await restoreMutation({ variables: { dishId } });
    },
    [restoreMutation],
  );

  const saveCategories = useCallback(
    async (slug: string, names: string[]): Promise<MenuCategoryType[] | null> => {
      setError(null);

      try {
        const resp = await saveCategoriesMutation({
          variables: { slug, names },
        });
        return _get<MenuCategoryType[]>(resp, "data.saveMenuCategories", []);
      } catch (thrown) {
        return failed(thrown, "Those sections could not be saved.");
      }
    },
    [saveCategoriesMutation, failed],
  );

  const renameCategory = useCallback(
    async (slug: string, from: string, to: string) => {
      setError(null);

      try {
        // `old` and `new` are the server's argument names. Both are reserved
        // words in enough languages that it is worth saying so here rather
        // than letting the next reader assume a typo.
        await renameCategoryMutation({
          variables: { slug, old: from, new: to },
        });
        return true;
      } catch (thrown) {
        failed(thrown, "That section could not be renamed.");
        return false;
      }
    },
    [renameCategoryMutation, failed],
  );

  const reorderDishes = useCallback(
    async (slug: string, dishIds: string[]) => {
      await reorderMutation({ variables: { slug, dishIds } });
    },
    [reorderMutation],
  );

  const markVerified = useCallback(
    async (slug: string) => {
      setError(null);

      try {
        await verifyMutation({ variables: { slug } });
        return true;
      } catch (thrown) {
        failed(thrown, "That could not be confirmed.");
        return false;
      }
    },
    [verifyMutation, failed],
  );

  return {
    submitDish,
    loadOwnerMenu,
    loadPendingDishes,
    decideDish,
    setAvailability,
    archiveDish,
    restoreDish,
    saveCategories,
    renameCategory,
    reorderDishes,
    markVerified,
    menuLoading,
    pendingLoading,
    error,
    clearError: () => setError(null),
  };
};

export default useMenuEditing;
