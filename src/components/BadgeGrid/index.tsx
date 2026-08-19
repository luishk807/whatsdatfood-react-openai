import { type FC } from "react";
import clsx from "clsx";
import BadgeIcon from "@/components/BadgeIcon";
import { BADGE_LABELS } from "@/customConstants/reputation";
import { BadgeGridInterface } from "@/interfaces/reputation";

/**
 * The badge shelf.
 *
 * Unearned badges are shown, greyed, with their progress — that is the whole
 * reason they are here. A badge you cannot see yourself approaching is a
 * surprise rather than an incentive, and "7 of 10 dishes" is a far better
 * prompt than a slot that fills in one day without warning.
 *
 * On somebody else's profile only earned badges arrive from the server, and
 * `showProgress` is off: how close a stranger is to something is their
 * business.
 */
const BadgeGrid: FC<BadgeGridInterface> = ({ badges, showProgress = true }) => {
  if (!badges.length) {
    return null;
  }

  return (
    <section className="flex w-full flex-col gap-3">
      <h3 className="text-sm font-semibold text-ink">{BADGE_LABELS.title}</h3>

      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {badges.map((badge) => {
          const earned = !!badge.earnedAt;

          return (
            <li
              key={badge.id}
              className={clsx(
                "flex flex-col items-center gap-1 rounded-card border p-3 text-center",
                earned
                  ? "border-line bg-surface-raised"
                  : "border-dashed border-line bg-surface",
              )}
              // The description is the instruction, and on a phone there is no
              // room for it under every tile.
              title={badge.description}
            >
              <BadgeIcon
                badgeId={badge.icon}
                earned={earned}
                size={36}
                className={earned ? "text-brand" : "text-ink-muted"}
              />

              <span
                className={clsx(
                  "text-[11px] font-medium leading-tight",
                  earned ? "text-ink" : "text-ink-muted",
                )}
              >
                {badge.name}
              </span>

              {!earned && showProgress && (
                <span className="text-[10px] tabular-nums text-ink-muted">
                  {BADGE_LABELS.progress(badge.progress, badge.target)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default BadgeGrid;
