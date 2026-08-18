import { type FC } from "react";
import clsx from "clsx";
import { FOOD_CRED_LABELS } from "@/customConstants/reputation";
import { LevelProgressInterface } from "@/interfaces/reputation";

/**
 * The level, and how far it is to the next one.
 *
 * Two numbers that say different true things, both shown because both are
 * asked. The caption is the total against the next threshold — "620 / 750",
 * which is how somebody describes where they are. The bar fills across the
 * band they are actually in, from 300 to 750, because a bar measured from zero
 * would sit almost full at every level and stop meaning anything.
 *
 * Both come off the server. A level computed in the browser is a level the
 * server never agreed to.
 */
const LevelProgress: FC<LevelProgressInterface> = ({
  level,
  foodCred,
  compact = false,
}) => {
  const atTop = level.next_at === null;
  const percent = Math.round(level.progress * 100);

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={clsx(
            "font-semibold text-ink",
            compact ? "text-sm" : "text-base",
          )}
        >
          {level.name}
        </span>
        {!atTop && (
          <span className="text-xs tabular-nums text-ink-muted">
            {foodCred} / {level.next_at}
          </span>
        )}
      </div>

      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-surface-sunken"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={
          level.next_name
            ? FOOD_CRED_LABELS.untilNext(level.cred_to_next, level.next_name)
            : FOOD_CRED_LABELS.atTopLevel
        }
      >
        <div
          className="h-full rounded-pill bg-brand transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>

      {!compact && (
        <p className="mt-1.5 text-xs text-ink-muted">
          {level.next_name
            ? FOOD_CRED_LABELS.untilNext(level.cred_to_next, level.next_name)
            : FOOD_CRED_LABELS.atTopLevel}
        </p>
      )}
    </div>
  );
};

export default LevelProgress;
