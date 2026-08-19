import { type FC } from "react";
import { Link } from "react-router-dom";
import QueueRowActions from "@/components/QueueRowActions";
import useQueueDecision from "@/customHooks/useQueueDecision";
import { ClaimReviewInterface } from "@/interfaces/ownership";
import { ADMIN_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";

/**
 * Ownership claims waiting on a decision.
 *
 * Approving one hands somebody editing rights over a restaurant's facts, so
 * the row leads with what they offered as proof rather than with their name.
 * "No verification offered" is stated rather than left blank — an empty space
 * where the evidence goes reads as a rendering problem, not as the answer.
 */
const ClaimReview: FC<ClaimReviewInterface> = ({
  claims,
  loading,
  onDecide,
}) => {
  const { busyId, failedId, run } = useQueueDecision(onDecide);

  if (loading) {
    return (
      <div className="h-20 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
    );
  }

  if (!claims.length) {
    return <p className="text-sm text-ink-muted">{ADMIN_LABELS.noClaims}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {claims.map((claim) => (
        <li
          key={claim.id}
          className="flex flex-col gap-2 rounded-card border border-line bg-surface-raised p-3"
        >
          <div className="flex flex-col gap-0.5">
            {claim.restaurant?.slug ? (
              <Link
                to={buildMenuResultsPath(claim.restaurant.slug)}
                className="text-sm font-semibold text-ink underline underline-offset-2"
              >
                {claim.restaurant?.name}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-ink">
                {claim.restaurant?.name}
              </span>
            )}

            {(claim.restaurant?.address || claim.restaurant?.city) && (
              <span className="text-xs text-ink-muted">
                {[claim.restaurant?.address, claim.restaurant?.city]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            )}
          </div>

          <dl className="flex flex-col gap-0.5 text-xs">
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-ink-muted">
                {ADMIN_LABELS.verification}
              </dt>
              <dd className="text-ink">
                {claim.verification_method || (
                  <span className="italic text-ink-muted">
                    {ADMIN_LABELS.noVerification}
                  </span>
                )}
              </dd>
            </div>

            {claim.note && (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-ink-muted">
                  {ADMIN_LABELS.note}
                </dt>
                <dd className="text-ink">{claim.note}</dd>
              </div>
            )}
          </dl>

          <QueueRowActions
            id={claim.id}
            affirmative={ADMIN_LABELS.approve}
            negative={ADMIN_LABELS.reject}
            busy={busyId === claim.id}
            failed={failedId === claim.id}
            onDecide={run}
          />
        </li>
      ))}
    </ul>
  );
};

export default ClaimReview;
