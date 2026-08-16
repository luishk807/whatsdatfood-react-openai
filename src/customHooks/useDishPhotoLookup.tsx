import { useCallback, useRef, useState } from "react";
import useRestaurantMutation from "@/customHooks/useRestaurantMutations";
import { _get } from "@/utils";
import { PHOTO_LOOKUP } from "@/customConstants/images";

/**
 * Finds a photo for a dish that has none yet.
 *
 * Two rules keep this affordable. It only runs for dishes the reader actually
 * scrolls to, and it stops after a fixed number per page view — previously
 * every dish on the page fired a lookup on every load, including dishes whose
 * photo was already cached.
 */
const useDishPhotoLookup = () => {
  const { getRestaurantImageById } = useRestaurantMutation();
  const [found, setFound] = useState<Record<number, string>>({});
  const requested = useRef<Set<number>>(new Set());
  const budget = useRef<number>(PHOTO_LOOKUP.MAX_PER_PAGE_VIEW);

  const lookup = useCallback(
    async (id?: number) => {
      const dishId = Number(id ?? 0);

      if (!dishId || requested.current.has(dishId) || budget.current <= 0) {
        return;
      }

      requested.current.add(dishId);
      budget.current -= 1;

      try {
        const resp = await getRestaurantImageById(dishId);
        const url = _get<string>(resp, "url_m", "");

        if (url) {
          setFound((prev) => ({ ...prev, [dishId]: url }));
        }
      } catch (err) {
        // A dish with no findable photo is a normal outcome, not an error the
        // reader needs to see. It simply keeps its empty state.
      }
    },
    [getRestaurantImageById],
  );

  return { found, lookup };
};

export default useDishPhotoLookup;
