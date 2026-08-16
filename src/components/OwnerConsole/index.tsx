import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useRestaurantOwnership from "@/customHooks/useRestaurantOwnership";
import { RestaurantClaimType } from "@/interfaces/ownership";
import { OWNER_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";

const STATUS_STYLE: Record<string, string> = {
  approved:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  rejected:
    "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

const STATUS_LABEL: Record<string, string> = {
  approved: OWNER_LABELS.claimApproved,
  pending: OWNER_LABELS.claimPending,
  rejected: OWNER_LABELS.claimRejected,
};

/**
 * What an owner sees: the restaurants they manage, and a way into each one.
 *
 * The boundary is stated on the page rather than buried in terms. It is the
 * reason anyone should believe the ratings, so it is worth the space.
 */
const OwnerConsole: FC = () => {
  const { loadClaims, claimsLoading } = useRestaurantOwnership();
  const [claims, setClaims] = useState<RestaurantClaimType[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadClaims().then((rows) => {
      if (!cancelled) {
        setClaims(rows);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadClaims]);

  return (
    <section className="flex w-full flex-col gap-5 px-4 py-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {OWNER_LABELS.consoleTitle}
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {OWNER_LABELS.boundary}
        </p>
      </header>

      {claimsLoading && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">…</p>
      )}

      {!claimsLoading && !claims.length && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {OWNER_LABELS.noClaims}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {claims.map((claim) => (
          <li
            key={claim.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {claim.restaurant?.name}
              </span>
              <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                {[claim.restaurant?.address, claim.restaurant?.city]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  STATUS_STYLE[claim.status] ?? STATUS_STYLE.rejected
                }`}
              >
                {STATUS_LABEL[claim.status] ?? claim.status}
              </span>

              {claim.status === "approved" && claim.restaurant?.slug && (
                <Link
                  to={buildMenuResultsPath(claim.restaurant.slug)}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-neutral-700 dark:text-neutral-200"
                >
                  {OWNER_LABELS.editFacts}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default OwnerConsole;
