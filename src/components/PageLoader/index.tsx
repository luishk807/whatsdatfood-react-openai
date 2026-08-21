import { type FC } from "react";
import { LOADING_LABELS } from "@/customConstants/labels";

/**
 * What a route shows while its chunk is downloading.
 *
 * **This exists because of one inline style.** Every lazy route in the app
 * rendered `<Loading style={{ width: "30px" }} />`, and an inline width beats
 * a class - so `w-full items-center justify-center` on the wrapper was
 * overridden and the whole loader collapsed into a thirty-pixel box pinned to
 * the top-left corner of the page. Twenty-three routes, every navigation, and
 * it read exactly like a broken image.
 *
 * A route loader has one job: hold the space the page is about to occupy so
 * the layout does not jump when it arrives, and be centred in it. It reserves
 * viewport height for that reason rather than sitting at natural height.
 *
 * **Drawn in CSS, not fetched.** The old default was an animated GIF, which
 * is a network request for a spinner, cannot take the theme, and cannot stop
 * moving for somebody who asked for less motion.
 */
const PageLoader: FC = () => (
  <div
    // Announced rather than silent: a screen reader on a slow connection was
    // told nothing at all while the page was blank.
    role="status"
    aria-live="polite"
    className="flex min-h-[60vh] w-full items-center justify-center"
  >
    <span
      aria-hidden="true"
      className="h-10 w-10 animate-spin rounded-full border-[3px] border-line border-t-brand motion-reduce:animate-none"
    />
    <span className="sr-only">{LOADING_LABELS.page}</span>
  </div>
);

export default PageLoader;
