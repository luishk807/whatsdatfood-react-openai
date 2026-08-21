import { useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import { MENU_STATUS } from "@/graphql/queries/menu";
import { MENU_WAIT } from "@/customConstants";
import { MenuStatusType } from "@/interfaces/menu";
import { _get } from "@/utils";

/**
 * Whether the menu is ready, coming, or not coming.
 *
 * **The restaurant page does not wait for this.** Opening a restaurant used to
 * generate its menu inside the same request: Black Fox Coffee took 15.2
 * seconds and then returned nothing at all, because a rate limit raised out of
 * the resolver and took the whole query down with it. The restaurant is a row
 * we already hold; the menu is expensive and sometimes impossible, and this is
 * the seam between them.
 *
 * **Polled only while something is actually running.** A restaurant whose menu
 * exists answers `ready` on the first ask and is never asked again, so the
 * common case - every repeat visit to every restaurant with a menu - costs one
 * request. Nothing here can start a generation either: only opening the
 * restaurant does that, so a page left open does not spend anything.
 */
const useMenuStatus = (
  slug: string | undefined,
  hasDishes: boolean,
  /**
   * False until the restaurant itself has arrived.
   *
   * Asking whether a menu is ready before we know the restaurant exists is
   * a request whose answer we cannot use, sent on every restaurant page in
   * the product. It also races the menu that is already on its way, and
   * would briefly claim `pending` for a restaurant whose dishes land a
   * moment later.
   */
  enabled = true,
) => {
  const { data, refetch, startPolling, stopPolling } = useQuery(MENU_STATUS, {
    variables: { slug: slug ?? "" },
    // Dishes already on screen answer the question. Asking anyway would be a
    // round trip to be told what the reader is looking at.
    skip: !slug || hasDishes || !enabled,
    // "Is it ready yet" is the one question here whose answer is different a
    // second later, so it is never served from the cache.
    fetchPolicy: "network-only",
  });

  const status = _get<MenuStatusType | null>(data, "menuStatus", null);
  const state = hasDishes ? "ready" : status?.state;
  const pending = state === "pending";

  useEffect(() => {
    if (pending) {
      startPolling(MENU_WAIT.POLL_MS);
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [pending, startPolling, stopPolling]);

  // How long this reader has been waiting, so the wording can change. Reset
  // whenever the wait restarts rather than measured from mount: a retry is a
  // new wait and should get the short message again.
  const [slow, setSlow] = useState(false);
  const since = useRef<number | null>(null);

  useEffect(() => {
    if (!pending) {
      since.current = null;
      setSlow(false);
      return;
    }

    if (since.current === null) {
      since.current = Date.now();
    }

    const timer = setTimeout(
      () => setSlow(true),
      MENU_WAIT.SLOW_AFTER_MS,
    );

    return () => clearTimeout(timer);
  }, [pending]);

  return {
    /** `ready` | `pending` | `unavailable`, or undefined before the first ask. */
    state,
    pending,
    /** Past the point where "a few seconds" stops being an honest thing to say. */
    slow,
    /** For the "Try again" control. */
    retry: refetch,
  };
};

export default useMenuStatus;
