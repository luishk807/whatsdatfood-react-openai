import { type FC } from "react";
import QueueRowActions from "@/components/QueueRowActions";
import useQueueDecision from "@/customHooks/useQueueDecision";
import { CORRECTION_LABELS } from "@/customConstants/labels";
import { CorrectionQueueInterface } from "@/interfaces/corrections";

/**
 * Suggested corrections waiting on a decision.
 *
 * Shown to admins and to owners of the restaurant in question — the server
 * scopes the queue, so an owner never sees another restaurant's suggestions.
 *
 * Each row shows what it says now beside what is proposed, because approving
 * a change you cannot see is not a decision. "was empty" is called out rather
 * than shown as blank: a suggestion that fills a hole is a different thing
 * from one that overwrites a fact, and it is worth knowing which you are
 * agreeing to.
 */
const CorrectionQueue: FC<CorrectionQueueInterface> = ({
  corrections,
  loading,
  onResolve,
}) => {
  const { busyId, failedId, run } = useQueueDecision(onResolve);

  if (loading) {
    return (
      <div className="h-20 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
    );
  }

  if (!corrections.length) {
    return <p className="text-sm text-ink-muted">{CORRECTION_LABELS.queueEmpty}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {corrections.map((correction) => (
        <li
          key={correction.id}
          className="flex flex-col gap-2 rounded-card border border-line bg-surface-raised p-3"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-ink">
              {correction.dish_name}
            </span>
            {correction.restaurant_name && (
              <span className="text-xs text-ink-muted">
                {correction.restaurant_name}
              </span>
            )}
          </div>

          <dl className="flex flex-col gap-0.5 text-sm">
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-xs text-ink-muted">
                {correction.field}
              </dt>
              <dd className="text-ink-muted line-through">
                {correction.previous_value ?? (
                  <span className="italic no-underline">
                    {CORRECTION_LABELS.wasEmpty}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0" aria-hidden="true" />
              <dd className="font-medium text-ink">{correction.value}</dd>
            </div>
          </dl>

          {correction.suggested_by && (
            <p className="text-[11px] text-ink-muted">
              @{correction.suggested_by}
            </p>
          )}

          <QueueRowActions
            id={correction.id}
            affirmative={CORRECTION_LABELS.approve}
            negative={CORRECTION_LABELS.reject}
            busy={busyId === correction.id}
            failed={failedId === correction.id}
            onDecide={run}
          />
        </li>
      ))}
    </ul>
  );
};

export default CorrectionQueue;
