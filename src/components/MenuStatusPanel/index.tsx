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
 * **It says what is happening to the restaurant, not what the page is doing.**
 * "Getting the menu ready" over a two-pixel pulsing dot, in the middle of an
 * otherwise empty panel, read as content that had failed to arrive — and on a
 * catalogue where most restaurants have no menu, "this looks broken" is the
 * one impression worth spending pixels to prevent. The earlier version chose
 * a whisper on the theory that a spinner reads as "nothing here works". That
 * was the wrong trade for the one panel on the page that genuinely *is*
 * working on something, and for a wait measured in tens of seconds rather
 * than one.
 *
 * **The bar has no percentage, and never will have a fake one.** The backend
 * does not know how far through a menu extraction is — it is batches against
 * a model, not a file upload — so an indeterminate bar is the honest shape.
 * A number here would be invented, and a progress bar that lies is worse than
 * no progress bar.
 *
 * **Three states, because three different things are true.** An ordinary
 * wait; a wait that has gone on long enough to be worth acknowledging; and a
 * preparation that stopped. A menu we cannot read is not an error — most
 * restaurants in the world have no menu online — so it gets a plain sentence
 * and, only where the server says another attempt is possible, a way to ask
 * again.
 */
const MenuStatusPanel: FC<MenuStatusPanelInterface> = ({
  state,
  slow,
  retryable,
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
    ? retryable
      ? MENU_STATUS_LABELS.failedBody
      : MENU_STATUS_LABELS.exhaustedBody
    : slow
      ? MENU_STATUS_LABELS.slowBody
      : MENU_STATUS_LABELS.pendingBody;

  return (
    <section
      // Announced, because the wording changes underneath a reader who may
      // not be looking at this part of the page.
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface-raised px-6 py-10 text-center"
    >
      <p className="text-base font-semibold text-ink">{title}</p>

      {!failed && (
        <>
          {/* Indeterminate on purpose: a bar that sweeps says "working" and
              claims nothing about how far along it is. `aria-valuenow` is
              deliberately absent — that is the attribute that would have to
              carry a number we do not have. */}
          <div
            role="progressbar"
            aria-label={MENU_STATUS_LABELS.progressLabel}
            className="h-1.5 w-full max-w-xs overflow-hidden rounded-pill bg-surface-sunken"
          >
            <span
              aria-hidden="true"
              /* Reduced motion gets a static filled bar rather than a
                 sweeping one. Still visibly a bar, still says "in progress",
                 and it does not move. */
              className="block h-full w-1/3 rounded-pill bg-brand motion-safe:animate-menu-sweep motion-reduce:w-full motion-reduce:opacity-60"
            />
          </div>

          <p className="max-w-sm text-sm text-ink-muted">{body}</p>

          {/* The sentence that makes the wait bearable. The work is on a
              background thread and outlives this page — nobody has to sit
              here guarding it, and saying so is the difference between
              waiting and being trapped. */}
          <p className="max-w-sm text-sm font-medium text-ink">
            {MENU_STATUS_LABELS.keepBrowsing}
          </p>
        </>
      )}

      {failed && <p className="max-w-sm text-sm text-ink-muted">{body}</p>}

      {failed && retryable && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex min-h-11 items-center rounded-pill border border-ink px-4 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          {MENU_STATUS_LABELS.retry}
        </button>
      )}
    </section>
  );
};

export default MenuStatusPanel;
