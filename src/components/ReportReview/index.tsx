import { type FC } from "react";
import { Link } from "react-router-dom";
import QueueRowActions from "@/components/QueueRowActions";
import useQueueDecision from "@/customHooks/useQueueDecision";
import { ReportReviewInterface } from "@/interfaces/ownership";
import { ADMIN_LABELS } from "@/customConstants/labels";
import { reportReasonLabel } from "@/customConstants/images";
import { buildMenuResultsPath } from "@/customConstants/routes";

/**
 * Reported photos waiting on a look.
 *
 * The question a report asks is "is this that dish?", so the row says which
 * dish it is on — it used to show the picture, the reason and the uploader's
 * handle, which is everything except the thing being judged.
 *
 * The photograph is large enough to judge. At the 64px it used to be, every
 * report was a decision made on a thumbnail, and the only wrong answer here
 * deletes somebody's contribution.
 */
const ReportReview: FC<ReportReviewInterface> = ({
  reports,
  loading,
  onResolve,
}) => {
  // `false` removes the photo, so the destructive half is the negative one:
  // keeping it is what happens when a report turns out to be wrong, which is
  // most of the time.
  const { busyId, failedId, run } = useQueueDecision((id, keep) =>
    onResolve(id, !keep),
  );

  if (loading) {
    return (
      <div className="h-28 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
    );
  }

  if (!reports.length) {
    return <p className="text-sm text-ink-muted">{ADMIN_LABELS.noReports}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => (
        <li
          key={report.id}
          className="flex flex-col gap-3 rounded-card border border-line bg-surface-raised p-3 sm:flex-row"
        >
          {report.photo?.url_m && (
            <img
              src={report.photo.url_m}
              alt=""
              className="h-40 w-full shrink-0 rounded-card object-cover sm:h-28 sm:w-28"
            />
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-ink">
                {report.dish_name || ADMIN_LABELS.unknownDish}
              </span>
              {report.restaurant_name &&
                (report.restaurant_slug ? (
                  <Link
                    to={buildMenuResultsPath(report.restaurant_slug)}
                    className="self-start text-xs text-ink-muted underline underline-offset-2"
                  >
                    {report.restaurant_name}
                  </Link>
                ) : (
                  <span className="text-xs text-ink-muted">
                    {report.restaurant_name}
                  </span>
                ))}
            </div>

            <dl className="flex flex-col gap-0.5 text-xs">
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-ink-muted">
                  {ADMIN_LABELS.reason}
                </dt>
                <dd className="text-ink">
                  {reportReasonLabel(report.reason)}
                </dd>
              </div>

              {report.note && (
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-ink-muted">
                    {ADMIN_LABELS.note}
                  </dt>
                  <dd className="text-ink">{report.note}</dd>
                </div>
              )}

              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-ink-muted">
                  {ADMIN_LABELS.uploadedBy}
                </dt>
                <dd className="text-ink">
                  {report.photo?.owner ? (
                    `@${report.photo.owner}`
                  ) : (
                    <span className="italic text-ink-muted">
                      {ADMIN_LABELS.unattributed}
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            <QueueRowActions
              id={report.id}
              affirmative={ADMIN_LABELS.keepPhoto}
              negative={ADMIN_LABELS.removePhoto}
              destructive
              busy={busyId === report.id}
              failed={failedId === report.id}
              onDecide={run}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ReportReview;
