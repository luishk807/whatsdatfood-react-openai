import { type FC } from "react";
import { useQuery } from "@apollo/client";
import clsx from "clsx";
import { FEATURE_STATUSES } from "@/graphql/queries/features";
import { FEATURE_STATUS } from "@/customConstants/features";
import { FEATURE_LABELS } from "@/customConstants/labels";
import { FeatureStatusType } from "@/interfaces/features";
import { _get } from "@/utils";

/**
 * What state each unlaunched feature is in, for the admin console.
 *
 * Admin only, enforced on the server — this names work that has not launched,
 * which is exactly what a normal visitor must not learn exists.
 *
 * Read-only. Changing the state is an environment variable and a restart, not
 * a button: a switch that flips a product live from a web page is one
 * mis-click away from launching it, and the deploy history is the audit trail.
 */
const TONE: Record<string, string> = {
  [FEATURE_STATUS.hidden]: "border-line text-ink-muted",
  [FEATURE_STATUS.internalTesting]: "border-warn text-warn",
  [FEATURE_STATUS.live]: "border-brand text-brand",
};

const FeatureStatus: FC = () => {
  const { data, loading, error } = useQuery(FEATURE_STATUSES, {
    fetchPolicy: "cache-and-network",
  });

  const statuses = _get<FeatureStatusType[]>(data, "featureStatuses", []) ?? [];

  if (loading && !statuses.length) {
    return (
      <div className="h-16 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
    );
  }

  if (error || !statuses.length) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2">
      {statuses.map((row) => (
        <li
          key={row.feature}
          className="flex items-center justify-between gap-3 rounded-card border border-line p-3"
        >
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium text-ink">
              {FEATURE_LABELS.name(row.feature)}
            </span>
            <span className="text-xs text-ink-muted">
              {FEATURE_LABELS.explain(row.status)}
            </span>
          </span>

          {/* The word carries the state; the tint only agrees with it. */}
          <span
            className={clsx(
              "shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold",
              TONE[row.status] ?? "border-line text-ink-muted",
            )}
          >
            {FEATURE_LABELS.status(row.status)}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default FeatureStatus;
