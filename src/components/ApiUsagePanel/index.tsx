import { type FC } from "react";
import { useQuery } from "@apollo/client";
import { API_USAGE } from "@/graphql/queries/usage";
import { USAGE_LABELS } from "@/customConstants/labels";
import { ApiUsagePeriodType, ApiUsageReportType } from "@/interfaces/usage";
import { _get } from "@/utils";

const money = (value: number) =>
  value >= 1 ? `$${value.toFixed(2)}` : `$${value.toFixed(4)}`;

const Period: FC<{ title: string; period: ApiUsagePeriodType }> = ({
  title,
  period,
}) => (
  <div className="flex flex-col gap-2 rounded-card border border-line p-3">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <span className="text-sm font-medium text-ink">
        {money(period.total_cost_usd)}
      </span>
    </div>

    {period.by_operation.length ? (
      <dl className="flex flex-col gap-0.5 text-xs">
        {period.by_operation.map((line) => (
          <div
            key={`${line.provider}:${line.operation}`}
            className="flex justify-between gap-3"
          >
            <dt className="truncate text-ink-muted">
              {USAGE_LABELS.operation(line.provider, line.operation)}
            </dt>
            <dd className="shrink-0 text-ink">
              {line.count}
              {line.cost_usd > 0 && (
                <span className="text-ink-muted"> · {money(line.cost_usd)}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    ) : (
      <p className="text-xs text-ink-muted">{USAGE_LABELS.nothingYet}</p>
    )}

    {period.by_model.length > 0 && (
      <dl className="flex flex-col gap-0.5 border-t border-line pt-2 text-xs">
        {period.by_model.map((line) => (
          <div key={line.model} className="flex justify-between gap-3">
            <dt className="truncate text-ink-muted">{line.model}</dt>
            <dd className="shrink-0 text-ink">
              {line.count} · {money(line.cost_usd)}
            </dd>
          </div>
        ))}
      </dl>
    )}
  </div>
);

/**
 * What the paid services cost, and how often they were not needed.
 *
 * **The hit rate is the headline, not the spend.** The bill is a symptom; the
 * proportion of searches answered from our own rows is the thing that decides
 * it, and it should climb on its own as the catalogue fills. A number that is
 * not moving means the local matcher is not finding restaurants we already
 * have — which is a bug, and one that shows up here long before it shows up
 * on an invoice.
 *
 * **A rate with no searches behind it is not zero, it is nothing.** Rendering
 * "0%" on a quiet day would read as a total failure of the thing that is
 * working.
 */
const ApiUsagePanel: FC = () => {
  const { data, loading, error } = useQuery(API_USAGE, {
    fetchPolicy: "cache-and-network",
  });

  const report = _get<ApiUsageReportType | null>(data, "apiUsage", null);

  if (loading && !report) {
    return (
      <div className="h-40 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
    );
  }

  // The API deploys separately and routinely lags. "Not available" is a
  // different claim from "nothing was spent".
  if (error || !report) {
    return (
      <p className="rounded-card border border-dashed border-line p-4 text-sm text-ink-muted">
        {USAGE_LABELS.unavailable}
      </p>
    );
  }

  const rate = report.today.local_hit_rate ?? report.this_month.local_hit_rate;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 rounded-card border border-line bg-surface-raised p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {USAGE_LABELS.hitRate}
        </p>
        <p className="text-2xl font-semibold tracking-tight text-ink">
          {rate === null || rate === undefined
            ? USAGE_LABELS.noSearchesYet
            : `${Math.round(rate * 100)}%`}
        </p>
        <p className="text-xs text-ink-muted">
          {USAGE_LABELS.hitRateBlurb(
            report.this_month.searches_served_locally,
            report.this_month.searches,
          )}
        </p>
      </div>

      <Period title={USAGE_LABELS.today} period={report.today} />
      <Period title={USAGE_LABELS.thisMonth} period={report.this_month} />

      {report.heaviest_callers.length > 0 && (
        <div className="flex flex-col gap-2 rounded-card border border-line p-3">
          <h3 className="text-sm font-semibold text-ink">
            {USAGE_LABELS.heaviest}
          </h3>
          {/* Hashed handles, never addresses. Enough to see one caller making
              ten thousand requests; not enough to make this a surveillance
              page. */}
          <p className="text-xs text-ink-muted">{USAGE_LABELS.heaviestNote}</p>
          <ul className="flex flex-col gap-0.5 text-xs">
            {report.heaviest_callers.map((caller) => (
              <li
                key={`${caller.user_id ?? ""}:${caller.caller ?? ""}`}
                className="flex justify-between gap-3"
              >
                <span className="truncate text-ink-muted">
                  {caller.user_id
                    ? USAGE_LABELS.signedInCaller(caller.user_id)
                    : caller.caller || USAGE_LABELS.unknownCaller}
                </span>
                <span className="shrink-0 text-ink">
                  {caller.count} · {money(caller.cost_usd)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApiUsagePanel;
