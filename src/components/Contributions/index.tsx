import { type FC } from "react";
import ContributorSummary from "@/components/ContributorSummary";
import FoodCredHistory from "@/components/FoodCredHistory";
import BadgeGrid from "@/components/BadgeGrid";
import useFoodCred from "@/customHooks/useFoodCred";
import useAuth from "@/customHooks/useAuth";
import { FOOD_CRED_LABELS } from "@/customConstants/reputation";

/**
 * The account's contributions page: standing at the top, the ledger under it.
 *
 * The ledger is on the same screen rather than behind a link because the
 * number above it is meaningless without the reasons, and a total nobody can
 * audit is a total nobody trusts.
 */
const Contributions: FC = () => {
  const { user } = useAuth();
  const { stats, statsLoading, events, historyLoading, unavailable } =
    useFoodCred();

  const name =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "";

  if (unavailable) {
    return (
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
          {FOOD_CRED_LABELS.unavailable}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {statsLoading && !stats ? (
        <div className="h-44 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
      ) : (
        stats && <ContributorSummary name={name} stats={stats} />
      )}

      {/* Between the standing and the ledger: badges are the goals, the ledger
          is the receipts. */}
      <BadgeGrid badges={stats?.badges ?? []} />

      <section>
        <h3 className="mb-2 text-sm font-semibold text-ink">
          {FOOD_CRED_LABELS.history}
        </h3>
        <FoodCredHistory events={events} loading={historyLoading} />
      </section>
    </div>
  );
};

export default Contributions;
