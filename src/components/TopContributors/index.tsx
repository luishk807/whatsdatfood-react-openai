import { type FC } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import ChampionIcon from "@/components/ChampionIcon";
import FoodCredIcon from "@/components/FoodCredIcon";
import {
  LEADERBOARD_LABELS,
  LEADERBOARD_PREVIEW,
} from "@/customConstants/reputation";
import { buildProfilePath } from "@/customConstants/routes";
import { TopContributorsInterface } from "@/interfaces/reputation";

/**
 * Who has contributed most to this restaurant.
 *
 * The number beside each name is Food Cred earned **here**, not the
 * contributor's global total. A stranger with ten thousand Cred from across
 * the city has not photographed anything at this restaurant, and putting them
 * on top would make every restaurant's list identical and meaningless.
 *
 * Three, then a link. A leaderboard is a supporting element on a page whose
 * job is the food — a full ranking above the menu would invert that.
 */
const TopContributors: FC<TopContributorsInterface> = ({
  standings,
  champion,
  loading,
  onViewAll,
}) => {
  // Nothing earned here yet is a complete answer. An empty "Top contributors"
  // heading is the same mistake as a "Most loved" strip with no votes in it:
  // it claims a thing the data has not earned.
  if (loading || !standings.length) {
    return null;
  }

  const preview = standings.slice(0, LEADERBOARD_PREVIEW);
  const hasMore = standings.length > preview.length;

  return (
    <section className="flex w-full flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {LEADERBOARD_LABELS.title}
        </h2>
        {(hasMore || onViewAll) && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink"
          >
            {LEADERBOARD_LABELS.viewAll}
          </button>
        )}
      </div>

      <ol className="flex flex-col">
        {preview.map((standing, index) => {
          const isChampion = champion?.username === standing.username;

          return (
            <li
              key={standing.username}
              className={clsx(
                "flex items-center gap-3 py-2",
                index > 0 && "border-t border-line",
              )}
            >
              <span className="w-4 shrink-0 text-xs tabular-nums text-ink-muted">
                {index + 1}
              </span>

              <Link
                to={buildProfilePath(standing.username)}
                className="min-w-0 flex-1 truncate text-sm text-ink hover:underline"
              >
                {standing.display_name}
              </Link>

              {isChampion && (
                // The title sits on the row rather than in a banner of its own.
                // It is a standing that changes hands, not a trophy cabinet.
                <span className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-line px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                  <ChampionIcon size={11} />
                  {LEADERBOARD_LABELS.champion}
                </span>
              )}

              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium tabular-nums text-brand">
                <FoodCredIcon size={11} />
                {standing.cred}
                <span className="font-normal">
                  {LEADERBOARD_LABELS.credSuffix}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default TopContributors;
