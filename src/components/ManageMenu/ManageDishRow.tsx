import { type FC, useState } from "react";
import clsx from "clsx";
import DishProvenance from "@/components/DishProvenance";
import { DISH_LABELS, MANAGE_MENU_LABELS } from "@/customConstants/labels";
import { ManageDishRowInterface } from "@/interfaces/menu";
import { dishPrice } from "@/utils/dish";
import { convertCurrency } from "@/utils/numbers";

/**
 * One dish, as its owner sees it.
 *
 * **Removing asks twice; everything else does not.** Marking a dish
 * unavailable is reversible in one tap and happens weekly, so a confirmation
 * there is friction on the common case. Removing it from the menu is the only
 * action here somebody would regret, so it is the only one that stops to ask
 * — the same rule the photo queue already uses.
 *
 * **The destructive control is not red until it is armed.** A row of dishes
 * each carrying a red button reads as a page full of warnings, and the eye
 * stops seeing any of them.
 */
const ManageDishRow: FC<ManageDishRowInterface> = ({
  dish,
  busy,
  onAvailability,
  onArchive,
  onApprove,
}) => {
  const [confirming, setConfirming] = useState(false);
  const available = dish.is_available !== false;
  // `dishPrice` treats zero as absent, which is what stops most of a menu
  // reading as free.
  const price = dishPrice(dish);

  const action =
    "min-h-9 rounded-pill border border-line px-3 text-xs font-medium text-ink hover:bg-surface-sunken disabled:opacity-50";

  return (
    <div
      className={clsx(
        "flex flex-col gap-2 rounded-card border p-3",
        available ? "border-line bg-surface-raised" : "border-line bg-surface-sunken",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className={clsx(
              "truncate text-sm font-medium",
              available ? "text-ink" : "text-ink-muted line-through",
            )}
          >
            {dish.name}
          </span>
          {dish.description && (
            <span className="line-clamp-2 text-xs text-ink-muted">
              {dish.description}
            </span>
          )}
        </div>

        {/* An em dash for a missing price, never $0.00. The extraction leaves
            price null across most of a menu and a formatter would turn that
            into a claim the food is free. */}
        <span className="shrink-0 text-sm tabular-nums text-ink-muted">
          {price !== null ? convertCurrency(price) : DISH_LABELS.priceUnavailable}
        </span>
      </div>

      <DishProvenance
        source={dish.source}
        verification_status={dish.verification_status}
        is_available={dish.is_available}
        added_by={dish.added_by}
        compact
      />

      <div className="flex flex-wrap gap-2 pt-1">
        {onApprove && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onApprove(dish, true)}
              className={clsx(action, "border-ink bg-ink text-surface hover:bg-ink")}
            >
              {MANAGE_MENU_LABELS.approve}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onApprove(dish, false)}
              className={action}
            >
              {MANAGE_MENU_LABELS.reject}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => onAvailability(dish, !available)}
          className={action}
        >
          {available
            ? MANAGE_MENU_LABELS.markUnavailable
            : MANAGE_MENU_LABELS.markAvailable}
        </button>

        {confirming ? (
          <span className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirming(false);
                onArchive(dish);
              }}
              className={clsx(
                action,
                "border-danger bg-danger text-white hover:bg-danger",
              )}
            >
              {MANAGE_MENU_LABELS.archiveConfirm}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-xs text-ink-muted underline underline-offset-2"
            >
              {MANAGE_MENU_LABELS.cancel}
            </button>
          </span>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirming(true)}
            className={action}
          >
            {MANAGE_MENU_LABELS.archive}
          </button>
        )}
      </div>

      {confirming && (
        <p className="text-[11px] text-ink-muted">
          {MANAGE_MENU_LABELS.archiveHelp}
        </p>
      )}
    </div>
  );
};

export default ManageDishRow;
