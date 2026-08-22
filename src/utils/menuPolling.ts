import { MENU_WAIT } from "@/customConstants";

/**
 * How often to ask whether the menu has arrived.
 *
 * **Asking gets slower the longer it has been.** Most menus land inside the
 * first half-minute, and a reader watching the panel should see it change
 * almost as soon as it does — so the early asking is quick. After that the
 * answer is unlikely to be different a moment later, and a page left open in
 * a tab must not go on asking twenty times a minute for an hour.
 *
 * **Polling cannot start work**, so none of this can spend money on a model:
 * `menuStatus` is one indexed read and the only thing allowed to queue a
 * generation is somebody opening the restaurant. Free of AI cost is not free
 * of server, though, which is what the ladder is for.
 *
 * Pure, so the ladder can be argued about without a timer or a network.
 */
export const pollInterval = (elapsedMs: number): number => {
  // Last step whose threshold has been passed. The list is short and ordered,
  // so this reads as the table it is.
  const step = [...MENU_WAIT.POLL_STEPS]
    .reverse()
    .find((one) => elapsedMs >= one.after);

  return step?.every ?? MENU_WAIT.POLL_MS;
};
