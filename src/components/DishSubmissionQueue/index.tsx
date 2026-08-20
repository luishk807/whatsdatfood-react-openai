import { type FC } from "react";
import { Link } from "react-router-dom";
import QueueRowActions from "@/components/QueueRowActions";
import { DISH_LABELS, MENU_EDIT_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";
import {
  DishSubmissionQueueInterface,
  ManagedDishType,
} from "@/interfaces/menu";
import useQueueDecision from "@/customHooks/useQueueDecision";
import { dishPrice } from "@/utils/dish";
import { convertCurrency } from "@/utils/numbers";

/**
 * Dishes diners have added, waiting on somebody.
 *
 * **The question is "is this real?", so the row shows what answers it.** The
 * dish, what it costs, which restaurant, and who added it — all four, because
 * a reviewer who has to click through to the menu to find out which restaurant
 * this is will not review anything. The photo queue learned the same lesson
 * the hard way: it used to show the picture, the reason and the uploader, and
 * everything except the dish it was supposed to be of.
 *
 * **Accepting is one click; rejecting asks twice.** The common outcome is that
 * a submission is fine, and the reversible action should not cost a
 * confirmation. Rejecting archives rather than destroys, but it is still the
 * one a reviewer would regret.
 */
const DishSubmissionQueue: FC<DishSubmissionQueueInterface> = ({
  submissions,
  loading,
  onDecide,
}) => {
  // Which row is busy and which one failed. Every queue in this product used
  // to fire and forget, so a click did nothing visible and a failed decision
  // looked exactly like a successful one.
  const { busyId, failedId, run } = useQueueDecision(onDecide);

  if (loading && !submissions.length) {
    return (
      <ul className="flex flex-col gap-2">
        {[0, 1].map((row) => (
          <li
            key={row}
            className="h-20 animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none"
          />
        ))}
      </ul>
    );
  }

  if (!submissions.length) {
    return (
      <p className="rounded-card border border-dashed border-line p-4 text-center text-sm text-ink-muted">
        {MENU_EDIT_LABELS.queueEmpty}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {submissions.map((dish) => {
        const price = dishPrice(dish);
        const slug = dish.restaurant?.slug;

        return (
          <li
            key={dish.id}
            className="flex flex-col gap-2 rounded-card border border-line bg-surface-raised p-3"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-semibold text-ink">
                {dish.name}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-ink-muted">
                {price !== null
                  ? convertCurrency(price)
                  : DISH_LABELS.priceUnavailable}
              </span>
            </div>

            {/* Which restaurant, and a way to go and look. "Is this on that
                menu?" is the whole question and it cannot be answered from
                the dish name alone. */}
            <p className="text-xs text-ink-muted">
              {slug ? (
                <Link
                  to={buildMenuResultsPath(slug)}
                  className="underline underline-offset-2 hover:text-ink"
                >
                  {dish.restaurant?.name}
                </Link>
              ) : (
                dish.restaurant?.name
              )}
              {dish.category && ` · ${dish.category}`}
              {dish.added_by && ` · ${MENU_EDIT_LABELS.communityBy(dish.added_by)}`}
            </p>

            {dish.description && (
              <p className="text-xs leading-relaxed text-ink-muted">
                {dish.description}
              </p>
            )}

            <QueueRowActions
              id={dish.id}
              affirmative={MENU_EDIT_LABELS.accept}
              negative={MENU_EDIT_LABELS.reject}
              busy={busyId === dish.id}
              failed={failedId === dish.id}
              destructive
              onDecide={run}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default DishSubmissionQueue;
