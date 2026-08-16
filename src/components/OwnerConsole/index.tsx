import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useRestaurantOwnership from "@/customHooks/useRestaurantOwnership";
import { RestaurantClaimType } from "@/interfaces/ownership";
import { OWNER_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";

const STATUS_STYLE: Record<string, string> = {
  approved:
    "bg-brand-soft text-brand",
  pending: "bg-warn-soft text-warn",
  rejected:
    "bg-surface-sunken text-ink",
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
        <h1 className="text-lg font-semibold text-ink">
          {OWNER_LABELS.consoleTitle}
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-ink-muted">
          {OWNER_LABELS.boundary}
        </p>
      </header>

      {claimsLoading && (
        <p className="text-sm text-ink-muted">…</p>
      )}

      {!claimsLoading && !claims.length && (
        <p className="text-sm text-ink-muted">
          {OWNER_LABELS.noClaims}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {claims.map((claim) => (
          <li
            key={claim.id}
            className="flex items-center justify-between gap-3 rounded-card border border-line p-3"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-ink">
                {claim.restaurant?.name}
              </span>
              <span className="truncate text-xs text-ink-muted">
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
                  className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink"
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
