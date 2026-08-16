import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import {
  RECORD_DISH_ORDERS,
  FORGET_DISH_ORDER,
} from "@/graphql/queries/restaurants";
import { MenuItemType } from "@/interfaces/restaurants";
import { _get } from "@/utils";
import useAuth from "@/customHooks/useAuth";

/**
 * Recording what someone ordered.
 *
 * A fact rather than an opinion, which is why people answer it far more
 * readily than a rating — and it is what produces "73% of people here order
 * this", a line a venue-level competitor cannot generate.
 */
const useDishOrders = () => {
  const { user } = useAuth();
  const [recordMutation, { loading: recording }] =
    useMutation(RECORD_DISH_ORDERS);
  const [forgetMutation] = useMutation(FORGET_DISH_ORDER);

  const record = useCallback(
    async (dishIds: Array<string | number>): Promise<number> => {
      const ids = dishIds.filter(Boolean).map(String);

      if (!ids.length || !user) {
        return 0;
      }

      const resp = await recordMutation({ variables: { dishIds: ids } });
      return Number(_get(resp, "data.recordDishOrders", 0)) || 0;
    },
    [user, recordMutation],
  );

  const forget = useCallback(
    async (dishId: string | number): Promise<boolean> => {
      if (!dishId || !user) {
        return false;
      }

      const resp = await forgetMutation({
        variables: { dishId: String(dishId) },
      });
      return !!_get(resp, "data.forgetDishOrder");
    },
    [user, forgetMutation],
  );

  /** Saying it by accident should be reversible, so this toggles. */
  const toggle = useCallback(
    async (item: MenuItemType): Promise<boolean> => {
      const id = item?.id;

      if (!id || !user) {
        return false;
      }

      if (item.ordered_by_me) {
        await forget(id);
        return false;
      }

      await record([id]);
      return true;
    },
    [user, record, forget],
  );

  return { record, forget, toggle, recording, canRecord: !!user };
};

export default useDishOrders;
