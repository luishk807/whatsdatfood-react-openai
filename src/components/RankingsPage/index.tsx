import { type FC } from "react";
import { Link } from "react-router-dom";
import BadgeGrid from "@/components/BadgeGrid";
import FoodCredAmount from "@/components/FoodCredAmount";
import FoodCredIcon from "@/components/FoodCredIcon";
import LevelProgress from "@/components/LevelProgress";
import useAuth from "@/customHooks/useAuth";
import useFoodCred from "@/customHooks/useFoodCred";
import { CONTRIBUTE_LABELS, RANKINGS_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

/**
 * How Food Cred works, in one place, away from the food.
 *
 * The homepage introduces the idea in three lines and links here. This is
 * where the rules go — what earns credit, what does not, and how the levels
 * work — because a scoring table on the front door is read by nobody and
 * pushes the photographs further down the page.
 *
 * **No point values are printed here.** `src/customConstants/reputation.ts`
 * deliberately holds none: a copy in the browser is a second source of truth
 * and invites a component to display a rule the server never agreed to. What
 * this page states is the *shape* of the system — which contributions count
 * for more and why — which is the part a contributor actually needs and the
 * part that does not drift. A signed-in reader sees their own real numbers
 * above it, which the server sends.
 */
const RankingsPage: FC = () => {
  const { user } = useAuth();
  const { stats, statsLoading, unavailable } = useFoodCred();
  const level = stats?.level;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pb-16 pt-6">
      <header className="flex flex-col gap-2">
        <span className="text-brand">
          <FoodCredIcon size={26} />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {RANKINGS_LABELS.title}
        </h1>
        <p className="text-sm text-ink-muted">{RANKINGS_LABELS.blurb}</p>
      </header>

      {user && !unavailable && (
        <section className="flex flex-col gap-3 rounded-card border border-line bg-surface-raised p-4">
          <h2 className="text-sm font-semibold text-ink">
            {CONTRIBUTE_LABELS.yourProgress}
          </h2>

          {statsLoading || !stats || !level ? (
            <div className="h-14 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
          ) : (
            <>
              <LevelProgress level={level} foodCred={stats.food_cred} />
              <p className="text-sm text-ink-muted">
                <FoodCredAmount amount={stats.food_cred} /> earned so far.
              </p>
            </>
          )}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-ink">
          {RANKINGS_LABELS.earningTitle}
        </h2>
        <p className="text-sm text-ink-muted">{RANKINGS_LABELS.earningBlurb}</p>

        <ul className="flex flex-col gap-2">
          {RANKINGS_LABELS.earning.map((rule) => (
            <li
              key={rule.title}
              className="flex flex-col gap-0.5 rounded-card border border-line p-3"
            >
              <span className="text-sm font-medium text-ink">{rule.title}</span>
              <span className="text-sm text-ink-muted">{rule.body}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-ink">
          {RANKINGS_LABELS.notEarningTitle}
        </h2>
        {/* Said out loud. A reputation system that only advertises what it
            rewards leaves people to discover the limits by hitting them. */}
        <ul className="flex list-inside list-disc flex-col gap-1 text-sm text-ink-muted">
          {RANKINGS_LABELS.notEarning.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-ink">
          {RANKINGS_LABELS.levelsTitle}
        </h2>
        <p className="text-sm text-ink-muted">{RANKINGS_LABELS.levelsBlurb}</p>
      </section>

      {/* Unearned badges render greyed with their progress — which is the
          whole reason to show them. A badge you cannot see yourself
          approaching is a surprise rather than an incentive. */}
      {user && !unavailable && stats?.badges?.length ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">
            {RANKINGS_LABELS.badgesTitle}
          </h2>
          <BadgeGrid badges={stats.badges} />
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-ink">
          {RANKINGS_LABELS.boardsTitle}
        </h2>
        <p className="text-sm text-ink-muted">{RANKINGS_LABELS.boardsBlurb}</p>
        {!user && (
          <Link
            to={ROUTES.createAccount}
            className="inline-flex min-h-11 items-center self-start rounded-pill bg-brand px-4 text-sm font-medium text-white"
          >
            {RANKINGS_LABELS.join}
          </Link>
        )}
      </section>
    </div>
  );
};

export default RankingsPage;
