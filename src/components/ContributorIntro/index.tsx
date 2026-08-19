import { type FC } from "react";
import { Link } from "react-router-dom";
import { AddAPhotoIcon, ChevronRightIcon, MedalIcon, ThumbUpIcon } from "@/components/icons";
import FoodCredIcon from "@/components/FoodCredIcon";
import LevelProgress from "@/components/LevelProgress";
import useAuth from "@/customHooks/useAuth";
import useFoodCred from "@/customHooks/useFoodCred";
import { CONTRIBUTE_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

const STEP_ICONS = [
  <AddAPhotoIcon size={18} key="photos" />,
  <ThumbUpIcon size={18} key="help" />,
  <MedalIcon size={18} key="medals" />,
];

/**
 * What this product wants from a reader, in three lines.
 *
 * Not the rules. The point thresholds, the badge shelf and the leaderboards
 * live on `/rankings`; somebody on the front door has to understand the shape
 * of it in a few seconds — take photos, help other diners, earn a standing —
 * and a scoring table here would be read by nobody and would push the food
 * further down the page.
 *
 * **Signed in, it shows the real number instead.** `LevelProgress` and
 * `useFoodCred` already exist and the server owns every figure in them, so the
 * personalised version is a swap rather than a second system. Somebody who has
 * already contributed does not need the pitch.
 */
const ContributorIntro: FC = () => {
  const { user } = useAuth();
  const { stats, statsLoading, unavailable } = useFoodCred();

  const level = stats?.level;

  return (
    <section
      className="flex flex-col gap-4 rounded-card border border-line bg-surface-raised p-4"
      aria-labelledby="contributor-intro"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-brand">
          <FoodCredIcon size={22} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2
            id="contributor-intro"
            className="text-base font-semibold text-ink"
          >
            {CONTRIBUTE_LABELS.title}
          </h2>
          <p className="text-sm text-ink-muted">{CONTRIBUTE_LABELS.blurb}</p>
        </div>
      </div>

      {/* The real standing, when there is one to show. `unavailable` rather
          than zero: the frontend deploys ahead of the API routinely, and
          "you have no contributions" is a different claim from "we could not
          ask". */}
      {user && !unavailable && (statsLoading || level) ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {CONTRIBUTE_LABELS.yourProgress}
          </p>
          {statsLoading || !stats || !level ? (
            <div className="h-12 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
          ) : (
            <LevelProgress level={level} foodCred={stats.food_cred} />
          )}
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {CONTRIBUTE_LABELS.steps.map((step, index) => (
            <li key={step.id} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-ink-muted">
                {STEP_ICONS[index]}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-ink">
                  {step.title}
                </span>
                <span className="text-sm text-ink-muted">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      <Link
        to={ROUTES.rankings}
        className="inline-flex min-h-11 items-center gap-0.5 self-start text-sm font-semibold text-ink underline underline-offset-2"
      >
        {CONTRIBUTE_LABELS.cta}
        <ChevronRightIcon size={14} />
      </Link>
    </section>
  );
};

export default ContributorIntro;
