import { FC, useCallback, useEffect, useState } from "react";
import useAdminQueues from "@/customHooks/useAdminQueues";
import useAuth from "@/customHooks/useAuth";
import {
  RestaurantClaimType,
  ReportedPhotoType,
} from "@/interfaces/ownership";
import { ADMIN_LABELS } from "@/customConstants/labels";
import { ACCOUNT_TYPE } from "@/customConstants";

/**
 * The two decisions only an admin makes: who owns a restaurant, and whether a
 * reported photo stays.
 *
 * Photo removal lives here and nowhere else, which is what stops an owner
 * quietly deleting the unflattering pictures of their food.
 */
const AdminConsole: FC = () => {
  const { user } = useAuth();
  const { loadClaims, loadReports, decideClaim, resolveReport, loading } =
    useAdminQueues();
  const [claims, setClaims] = useState<RestaurantClaimType[]>([]);
  const [reports, setReports] = useState<ReportedPhotoType[]>([]);

  const isAdmin = String(user?.role_id ?? "") === ACCOUNT_TYPE.admin;

  const refresh = useCallback(async () => {
    if (!isAdmin) {
      return;
    }

    setClaims(await loadClaims());
    setReports(await loadReports());
  }, [isAdmin, loadClaims, loadReports]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!isAdmin) {
    return null;
  }

  return (
    <section className="flex w-full flex-col gap-8 px-4 py-4">
      <h1 className="text-lg font-semibold text-ink">
        {ADMIN_LABELS.title}
      </h1>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {ADMIN_LABELS.claims}
        </h2>

        {!loading && !claims.length && (
          <p className="text-sm text-ink-muted">
            {ADMIN_LABELS.noClaims}
          </p>
        )}

        <ul className="flex flex-col gap-2">
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
                  {claim.verification_method ?? "no verification offered"}
                  {claim.note ? ` · ${claim.note}` : ""}
                </span>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await decideClaim(claim.id, true);
                    refresh();
                  }}
                  className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white"
                >
                  {ADMIN_LABELS.approve}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await decideClaim(claim.id, false);
                    refresh();
                  }}
                  className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink"
                >
                  {ADMIN_LABELS.reject}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {ADMIN_LABELS.reports}
        </h2>
        <p className="text-xs text-ink-muted">
          {ADMIN_LABELS.removeWarning}
        </p>

        {!loading && !reports.length && (
          <p className="text-sm text-ink-muted">
            {ADMIN_LABELS.noReports}
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="flex items-center gap-3 rounded-card border border-line p-3"
            >
              {report.photo?.url_m && (
                <img
                  src={report.photo.url_m}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded object-cover"
                />
              )}

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-ink">
                  {report.reason}
                </span>
                <span className="truncate text-xs text-ink-muted">
                  {report.photo?.owner ? `@${report.photo.owner}` : "unattributed"}
                  {report.note ? ` · ${report.note}` : ""}
                </span>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await resolveReport(report.id, false);
                    refresh();
                  }}
                  className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink"
                >
                  {ADMIN_LABELS.keepPhoto}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await resolveReport(report.id, true);
                    refresh();
                  }}
                  className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white"
                >
                  {ADMIN_LABELS.removePhoto}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AdminConsole;
