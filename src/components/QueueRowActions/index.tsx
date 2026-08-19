import { type FC, useState } from "react";
import clsx from "clsx";
import { QueueRowActionsInterface } from "@/interfaces/ownership";
import { ADMIN_LABELS } from "@/customConstants/labels";

/**
 * The two buttons at the bottom of a queue row, and what they say while they
 * are working.
 *
 * One component because all three queues need identical behaviour and had none
 * of it: a click did nothing visible until the page reloaded behind it, so the
 * natural response was to click again.
 *
 * `destructive` adds a second click. Removing a photo is the only way one
 * disappears from this product, and it is one tap from a list of thumbnails on
 * a phone — the confirmation is not ceremony, it is the difference between a
 * decision and a mis-tap.
 */
const QueueRowActions: FC<QueueRowActionsInterface> = ({
  id,
  affirmative,
  negative,
  busy,
  failed,
  destructive,
  onDecide,
}) => {
  const [confirming, setConfirming] = useState(false);

  const decide = (value: boolean) => {
    if (destructive && !value && !confirming) {
      setConfirming(true);
      return;
    }

    setConfirming(false);
    onDecide(id, value);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => decide(true)}
        className="rounded-pill border border-brand bg-brand-soft px-3 py-1 text-xs font-semibold text-brand hover:bg-brand hover:text-white disabled:opacity-50"
      >
        {affirmative}
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={() => decide(false)}
        className={clsx(
          "rounded-pill px-3 py-1 text-xs disabled:opacity-50",
          destructive
            ? "border border-danger font-semibold text-danger hover:bg-danger hover:text-white"
            : "border border-line text-ink-muted hover:border-ink hover:text-ink",
          confirming && "bg-danger text-white",
        )}
      >
        {confirming ? ADMIN_LABELS.confirmRemove : negative}
      </button>

      {confirming && (
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-ink-muted underline underline-offset-2"
        >
          {ADMIN_LABELS.cancel}
        </button>
      )}

      {busy && (
        <span role="status" className="text-xs text-ink-muted">
          {ADMIN_LABELS.working}
        </span>
      )}

      {failed && !busy && (
        <span role="alert" className="text-xs text-danger">
          {ADMIN_LABELS.decisionFailed}
        </span>
      )}
    </div>
  );
};

export default QueueRowActions;
