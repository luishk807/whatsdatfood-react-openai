import { type FC } from "react";
import { Link } from "react-router-dom";
import { DUPLICATE_LABELS } from "@/customConstants/labels";
import { DUPLICATE_STATUS } from "@/customConstants/duplicates";
import { buildMenuResultsPath } from "@/customConstants/routes";
import {
  DuplicateQueueInterface,
  DuplicateSideType,
} from "@/interfaces/duplicates";

/**
 * Two rows that might be one restaurant, side by side.
 *
 * **The decision is a comparison, so the queue is a comparison.** Both
 * records are shown in full — name, address, coordinates, phone, website,
 * external id, how much menu each has — because an admin who has to open two
 * tabs to decide will not decide, and a queue nobody works is worse than no
 * queue.
 *
 * **Nothing here merges or deletes.** "Mark as duplicate" records what
 * somebody concluded and stops. Moving photographs, votes and menu items
 * between two restaurants safely is its own piece of work, and doing it badly
 * loses contributions permanently with no undo — so the wording says what
 * actually happens rather than implying an action the product cannot take.
 *
 * **The reasons are shown, not just the score.** A confidence number on its
 * own is a request to trust arithmetic nobody can inspect. The chain count is
 * there for the same reason: an admin looking at two rows called Pret A
 * Manger needs to know the detector knew that too.
 */
const Side: FC<{ side: DuplicateSideType }> = ({ side }) => (
  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
    <Link
      to={side.slug ? buildMenuResultsPath(side.slug) : "#"}
      className="truncate text-sm font-semibold text-ink underline-offset-2 hover:underline"
    >
      {side.name}
    </Link>

    <span className="truncate text-xs text-ink-muted">
      {[side.address, side.city].filter(Boolean).join(", ") || "—"}
    </span>

    <span className="truncate text-xs text-ink-muted">
      {side.phone || "—"}
    </span>

    {side.website ? (
      <a
        href={side.website}
        target="_blank"
        rel="noreferrer noopener"
        className="truncate text-xs text-ink underline underline-offset-2"
      >
        {side.website.replace(/^https?:\/\/(www\.)?/, "")}
      </a>
    ) : (
      <span className="text-xs text-ink-muted">—</span>
    )}

    <span className="truncate text-xs text-ink-muted">
      {[side.place_type, side.cuisine].filter(Boolean).join(" · ") || "—"}
    </span>

    {/* The external id is part of the evidence: two OSM objects for one shop
        is the commonest way a duplicate gets in. */}
    <span className="truncate text-xs tabular-nums text-ink-muted">
      {side.osm_id || "—"}
    </span>

    <span className="truncate text-xs text-ink-muted">
      {side.menu_items
        ? DUPLICATE_LABELS.dishes(side.menu_items)
        : DUPLICATE_LABELS.noMenu}
    </span>
  </div>
);

const DuplicateQueue: FC<DuplicateQueueInterface> = ({
  pairs,
  loading,
  busyId,
  onResolve,
}) => {
  if (loading) {
    return <p className="text-sm text-ink-muted">{DUPLICATE_LABELS.loading}</p>;
  }

  if (!pairs.length) {
    return <p className="text-sm text-ink-muted">{DUPLICATE_LABELS.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Said once, above the queue, so nobody expects a merge to happen. */}
      <p className="text-xs text-ink-muted">{DUPLICATE_LABELS.noMerge}</p>

      <ul className="flex flex-col gap-3">
        {pairs.map((pair) => {
          const busy = busyId === pair.id;

          return (
            <li
              key={pair.id}
              className="flex flex-col gap-2 rounded-card border border-line p-3"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-ink-muted">
                <span className="font-medium text-ink">
                  {DUPLICATE_LABELS.apart(pair.metres)}
                </span>
                <span>{DUPLICATE_LABELS.confidence(pair.confidence)}</span>
                {pair.chain_locations > 1 && (
                  <span>{DUPLICATE_LABELS.chain(pair.chain_locations)}</span>
                )}
              </div>

              <div className="flex gap-3">
                {pair.left && <Side side={pair.left} />}
                {pair.right && <Side side={pair.right} />}
              </div>

              {pair.reasons && (
                <p className="text-xs italic text-ink-muted">{pair.reasons}</p>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onResolve(pair.id, DUPLICATE_STATUS.confirmed)}
                  className="min-h-9 rounded-pill border border-ink px-3 text-xs font-medium text-ink disabled:opacity-60"
                >
                  {DUPLICATE_LABELS.confirm}
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onResolve(pair.id, DUPLICATE_STATUS.rejected)}
                  className="min-h-9 rounded-pill border border-line px-3 text-xs text-ink disabled:opacity-60"
                >
                  {DUPLICATE_LABELS.reject}
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onResolve(pair.id, DUPLICATE_STATUS.dismissed)}
                  className="min-h-9 rounded-pill border border-line px-3 text-xs text-ink-muted disabled:opacity-60"
                >
                  {DUPLICATE_LABELS.dismiss}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DuplicateQueue;
