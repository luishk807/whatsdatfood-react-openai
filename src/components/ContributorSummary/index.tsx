import { type FC } from "react";
import FoodCredAmount from "@/components/FoodCredAmount";
import LevelProgress from "@/components/LevelProgress";
import { FOOD_CRED_LABELS } from "@/customConstants/reputation";
import { ContributorSummaryInterface } from "@/interfaces/reputation";

const Stat: FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col">
    <span className="text-lg font-semibold tabular-nums text-ink">{value}</span>
    <span className="text-xs text-ink-muted">{label}</span>
  </div>
);

/**
 * Who somebody is as a contributor: name, level, total, what they have added.
 *
 * Reputation is a supporting element here, not the subject. It gets one quiet
 * panel — no trophies stacked above the fold, no colour competing with the
 * photography, and the vote's brand tone used only on the number itself.
 */
const ContributorSummary: FC<ContributorSummaryInterface> = ({
  name,
  stats,
  subtitle,
}) => (
  <section className="w-full rounded-card border border-line bg-surface-raised p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-ink">{name}</h2>
        <p className="text-sm text-ink-muted">
          {subtitle ?? stats.level?.name}
        </p>
      </div>
      <FoodCredAmount amount={stats.food_cred} size="lg" />
    </div>

    {/* Three numbers, not a dashboard. Photos is the one being asked for; the
        other two say the contribution spread out rather than piling onto one
        dish. */}
    <div className="mt-4 grid grid-cols-3 gap-3">
      <Stat value={stats.photo_count} label={FOOD_CRED_LABELS.photos} />
      <Stat value={stats.dish_count} label={FOOD_CRED_LABELS.dishes} />
      <Stat
        value={stats.restaurant_count}
        label={FOOD_CRED_LABELS.restaurants}
      />
    </div>

    {stats.level && (
      <div className="mt-4 border-t border-line pt-4">
        <LevelProgress level={stats.level} foodCred={stats.food_cred} />
      </div>
    )}
  </section>
);

export default ContributorSummary;
