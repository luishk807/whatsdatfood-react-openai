import { useCallback, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  PENDING_MENU_CORRECTIONS,
  RESOLVE_MENU_CORRECTION,
  SUGGEST_DISH_CORRECTION,
} from "@/graphql/queries/corrections";
import { MenuCorrectionType } from "@/interfaces/corrections";
import { _get } from "@/utils";

/**
 * Suggesting a menu correction, and deciding one.
 *
 * The queue is `network-only`: it is a work list, and a cached one shows an
 * item somebody else has already dealt with.
 */
const useMenuCorrections = () => {
  const [suggestMutation] = useMutation(SUGGEST_DISH_CORRECTION);
  const [resolveMutation] = useMutation(RESOLVE_MENU_CORRECTION);
  const [fetchPending, { loading }] = useLazyQuery(PENDING_MENU_CORRECTIONS, {
    fetchPolicy: "network-only",
  });
  const [error, setError] = useState<string | null>(null);

  const suggest = useCallback(
    async (dishId: number, field: string, value: string) => {
      setError(null);

      try {
        await suggestMutation({ variables: { dishId: String(dishId), field, value } });
        return true;
      } catch (err) {
        // The server refuses a duplicate, an allergen field, an unparseable
        // price. Every one of those is worth showing verbatim: it explains a
        // rule rather than reporting a failure.
        setError(
          err instanceof Error ? err.message : "That could not be sent.",
        );
        return false;
      }
    },
    [suggestMutation],
  );

  const loadPending = useCallback(async (): Promise<MenuCorrectionType[]> => {
    const resp = await fetchPending({ variables: { page: 1, limit: 25 } });
    return (
      _get<MenuCorrectionType[]>(resp, "data.pendingMenuCorrections.data", []) ??
      []
    );
  }, [fetchPending]);

  const resolve = useCallback(
    async (correctionId: string, approve: boolean) => {
      await resolveMutation({ variables: { correctionId, approve } });
    },
    [resolveMutation],
  );

  return { suggest, loadPending, resolve, loading, error, clearError: () => setError(null) };
};

export default useMenuCorrections;
