import { type FC } from "react";
import { useQuery } from "@apollo/client";
import MembershipPlans from "@/components/MembershipPlans";
import useAuth from "@/customHooks/useAuth";
import { MEMBERSHIP_PLANS_QUERY } from "@/graphql/queries/features";
import { MEMBERSHIP_LABELS } from "@/customConstants/labels";
import { MembershipPlanType } from "@/interfaces/membership";
import { membershipOf } from "@/utils/entitlement";
import { _get } from "@/utils";

/**
 * WhatsDatFood Pro.
 *
 * Only ever reached through `FeatureRoute`, so by the time this renders the
 * server has already said this caller may see Pro. It guards nothing itself —
 * two components deciding the same thing is how they come to disagree.
 *
 * **The plans come from the server, not from a constant in this bundle.** The
 * catalogue is the second of two locks: the flag decides whether Pro exists
 * for somebody, and the plan list decides whether there is anything to buy.
 * Both are shut today, and turning one on does not open the other.
 */
const ProPage: FC = () => {
  const { user } = useAuth();
  const { data, loading } = useQuery(MEMBERSHIP_PLANS_QUERY, {
    fetchPolicy: "cache-first",
  });

  const plans = _get<MembershipPlanType[]>(data, "membershipPlans", []) ?? [];
  const tier = membershipOf(user);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16 pt-8">
      {tier && (
        <p className="rounded-card border border-brand bg-brand-soft/30 p-3 text-sm text-ink">
          {MEMBERSHIP_LABELS.memberSince(tier)}
        </p>
      )}

      {loading ? (
        <div className="h-48 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
      ) : (
        <MembershipPlans plans={plans} />
      )}

      {/* With no plan configured `MembershipPlans` renders nothing at all,
          which leaves this page holding only whatever is true — today, that
          somebody reached a page for a product with nothing to sell. Said
          plainly rather than dressed as a teaser. */}
      {!loading && !plans.length && (
        <p className="text-sm text-ink-muted">{MEMBERSHIP_LABELS.nothingYet}</p>
      )}
    </div>
  );
};

export default ProPage;
