import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import { MENU_STATUS } from "@/graphql/queries/menu";
import { MENU_WAIT } from "@/customConstants";
import { pollInterval } from "@/utils/menuPolling";
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
  /**
   * Whether asking again could produce a different answer.
   *
   * The server owns this. "Has this restaurant used up its attempts" is a
   * rule about our data, and a copy of it here would be a second source of
   * truth and the one that goes stale — the same reason the trending
   * threshold lives on the server.
   */
  const retryable = Boolean(status?.retryable);

  // How long this reader has been waiting, so the wording and the asking can
  // both change. Reset whenever the wait restarts rather than measured from
  // mount: a retry is a new wait and should get the short message again.
  const [slow, setSlow] = useState(false);
  const [waited, setWaited] = useState(0);
  const since = useRef<number | null>(null);

  useEffect(() => {
    if (!pending) {
      since.current = null;
      setSlow(false);
      setWaited(0);
      return;
    }

    if (since.current === null) {
      since.current = Date.now();
    }

    const timer = setTimeout(() => setSlow(true), MENU_WAIT.SLOW_AFTER_MS);

    return () => clearTimeout(timer);
  }, [pending]);

  /**
   * Ask, less and less often, and stop the moment the answer is final.
   *
   * `ready`, `unavailable` and a menu already on screen all end it — there is
   * nothing further to learn, and a page left open in a tab must not go on
   * asking forever. Unmounting ends it too: the cleanup runs on every change
   * of interval and on the way out.
   */
  useEffect(() => {
    if (!pending) {
      stopPolling();
      return;
    }

    startPolling(pollInterval(waited));

    // Re-evaluated on a timer of its own rather than off each response, so
    // the ladder still advances if a request is slow or in flight.
    const step = setTimeout(
      () => setWaited(Date.now() - (since.current ?? Date.now())),
      pollInterval(waited),
    );

    return () => {
      clearTimeout(step);
      stopPolling();
    };
  }, [pending, waited, startPolling, stopPolling]);

  /**
   * Ask for it again.
   *
   * **Deliberately not a mutation of its own.** There is exactly one way a
   * menu comes into existence — somebody opening the restaurant — and
   * `tests/test_menus_stay_demand_driven.py` fails if a second appears. So a
   * retry is the restaurant query run again, which lands on that same call
   * site and is refused by the same claim, backoff and budget guards. It
   * cannot start a second extraction of a restaurant already being worked
   * on, however many times it is pressed.
   *
   * The status read is refreshed alongside it so the panel reacts at once
   * rather than at the next tick of the poll.
   */
  const retry = useCallback(
    (regenerate?: () => void) => {
      since.current = null;
      setSlow(false);
      setWaited(0);
      regenerate?.();

      return refetch();
    },
    [refetch],
  );

  return {
    /** `ready` | `pending` | `unavailable`, or undefined before the first ask. */
    state,
    pending,
    /** Past the point where "a few seconds" stops being an honest thing to say. */
    slow,
    /** Whether the server says another attempt is worth offering. */
    retryable,
    /** For the "Try again" control. */
    retry,
  };
};

export default useMenuStatus;
