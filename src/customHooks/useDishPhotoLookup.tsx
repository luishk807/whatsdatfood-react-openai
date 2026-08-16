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
/**
 * Session-scoped, so navigating away and back does not pay for the same dish
 * twice. `resolved` holds the URLs we found; `missing` is a negative cache —
 * a dish with no findable photo is remembered as such, because the backend
 * records successes but not failures.
 */
const resolved = new Map<number, string>();
const missing = new Set<number>();

const useDishPhotoLookup = () => {
  const { getRestaurantImageById } = useRestaurantMutation();
  const [found, setFound] = useState<Record<number, string>>(() =>
    Object.fromEntries(resolved),
  );
  const requested = useRef<Set<number>>(new Set());
  const budget = useRef<number>(PHOTO_LOOKUP.MAX_PER_PAGE_VIEW);

  const lookup = useCallback(
    async (id?: number) => {
      const dishId = Number(id ?? 0);

      if (!dishId || requested.current.has(dishId) || missing.has(dishId)) {
        return;
      }

      // A photo we already resolved this session costs nothing and must not
      // consume the budget.
      const cached = resolved.get(dishId);

      if (cached) {
        requested.current.add(dishId);
        setFound((prev) => (prev[dishId] ? prev : { ...prev, [dishId]: cached }));
        return;
      }

      if (budget.current <= 0) {
        return;
      }

      requested.current.add(dishId);
      budget.current -= 1;

      try {
        const resp = await getRestaurantImageById(dishId);
        const url = _get<string>(resp, "url_m", "");

        if (url) {
          resolved.set(dishId, url);
          setFound((prev) => ({ ...prev, [dishId]: url }));
        } else {
          missing.add(dishId);
        }
      } catch (err) {
        // A dish with no findable photo is a normal outcome, not an error the
        // reader needs to see. It keeps its empty state and is not retried.
        missing.add(dishId);
      }
    },
    [getRestaurantImageById],
  );

  return { found, lookup };
};

export default useDishPhotoLookup;
