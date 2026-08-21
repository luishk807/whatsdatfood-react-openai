import { type FC } from "react";
import { MENU_STATUS_LABELS } from "@/customConstants/labels";
import { MenuStatusPanelInterface } from "@/interfaces/menu";

/**
 * What sits where the menu goes, when there is no menu yet.
 *
 * **Only this section waits.** The restaurant's name, address, map and photo
 * controls are already on the page above it — they come out of a row we hold
 * and never needed anything expensive. The page used to be replaced wholesale
 * by skeletons and then, when the model was busy, by nothing at all: no name,
 * no address, fifteen seconds of grey and then an empty screen.
 *
 * **Two stages, because the honest sentence changes.** The first few seconds
 * are an ordinary wait. Past that it is worth saying the rest of the page
 * works, so nobody sits watching a panel wondering whether to leave.
 *
 * **A menu we cannot read is not a failure state.** Most restaurants in the
 * world have no menu online, so `unavailable` gets a plain sentence and a way
 * to ask again — not an error, and never an infinite skeleton.
 */
const MenuStatusPanel: FC<MenuStatusPanelInterface> = ({
  state,
  slow,
  onRetry,
}) => {
  if (state === "ready" || !state) {
    return null;
  }

  const failed = state === "unavailable";

  const title = failed
    ? MENU_STATUS_LABELS.failedTitle
    : slow
      ? MENU_STATUS_LABELS.slowTitle
      : MENU_STATUS_LABELS.pendingTitle;

  const body = failed
    ? null
    : slow
      ? MENU_STATUS_LABELS.slowBody
      : MENU_STATUS_LABELS.pendingBody;

  return (
    <section
      // Announced, because the wording changes underneath a reader who may
      // not be looking at this part of the page.
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line px-6 py-10 text-center"
    >
      {!failed && (
        // A slow, quiet pulse rather than a spinner. A spinner in the middle
        // of a page reads as "nothing here works"; this reads as "something
        // is happening over here".
        <span
          aria-hidden="true"
          className="mb-1 h-2 w-2 animate-pulse rounded-full bg-ink-muted motion-reduce:animate-none"
        />
      )}

      <p className="text-sm font-medium text-ink">{title}</p>

      {body && <p className="max-w-sm text-sm text-ink-muted">{body}</p>}

      {failed && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex min-h-11 items-center rounded-pill border border-ink px-4 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          {MENU_STATUS_LABELS.retry}
        </button>
      )}
    </section>
  );
};

export default MenuStatusPanel;
