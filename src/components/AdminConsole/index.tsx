import { type FC, useCallback, useEffect, useState } from "react";
import useAdminQueues from "@/customHooks/useAdminQueues";
import useMenuCorrections from "@/customHooks/useMenuCorrections";
import ApiUsagePanel from "@/components/ApiUsagePanel";
import FeatureStatus from "@/components/FeatureStatus";
import CorrectionQueue from "@/components/CorrectionQueue";
import ClaimReview from "@/components/ClaimReview";
import ReportReview from "@/components/ReportReview";
import useAuth from "@/customHooks/useAuth";
import {
  RestaurantClaimType,
  ReportedPhotoType,
} from "@/interfaces/ownership";
import { MenuCorrectionType } from "@/interfaces/corrections";
import {
  ADMIN_LABELS,
  CORRECTION_LABELS,
  FEATURE_LABELS,
  USAGE_LABELS,
} from "@/customConstants/labels";
import { ACCOUNT_TYPE } from "@/customConstants";

/**
 * The decisions only an admin makes: who owns a restaurant, whether a reported
 * photo stays, and whether a suggested correction is applied.
 *
 * Photo removal lives here and nowhere else, which is what stops an owner
 * quietly deleting the unflattering pictures of their food.
 *
 * The count is in every heading and in one line at the top, because the most
 * common visit to this page ends in "nothing to do" and that answer should
 * cost one glance rather than three scrolls past three empty sections.
 */
const AdminConsole: FC = () => {
  const { user } = useAuth();
  const { loadClaims, loadReports, decideClaim, resolveReport, loading } =
    useAdminQueues();
  const [claims, setClaims] = useState<RestaurantClaimType[]>([]);
  const [reports, setReports] = useState<ReportedPhotoType[]>([]);
  const {
    loadPending: loadCorrections,
    resolve: resolveCorrection,
    loading: correctionsLoading,
  } = useMenuCorrections();
  const [corrections, setCorrections] = useState<MenuCorrectionType[]>([]);
  const [loaded, setLoaded] = useState(false);

  const isAdmin = String(user?.role_id ?? "") === ACCOUNT_TYPE.admin;

  const refresh = useCallback(async () => {
    if (!isAdmin) {
      return;
    }

    setClaims(await loadClaims());
    setReports(await loadReports());
    setCorrections(await loadCorrections());
    setLoaded(true);
  }, [isAdmin, loadClaims, loadReports, loadCorrections]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!isAdmin) {
    // Not nothing. A blank page under a heading reads as a page that failed.
    return <p className="text-sm text-ink-muted">{ADMIN_LABELS.notForYou}</p>;
  }

  const busy = loading || correctionsLoading;
  const waiting = corrections.length + claims.length + reports.length;

  return (
    <section className="flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-ink-muted">{ADMIN_LABELS.blurb}</p>
        {loaded && (
          <p className="text-sm font-medium text-ink">
            {waiting ? ADMIN_LABELS.waiting(waiting) : ADMIN_LABELS.allClear}
          </p>
        )}
      </div>

      {/* Corrections first: they are the cheapest decision here and the one
          that most directly improves what a reader sees. */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {CORRECTION_LABELS.queueTitle}
          {corrections.length > 0 && ` (${corrections.length})`}
        </h2>
        <CorrectionQueue
          corrections={corrections}
          loading={correctionsLoading && !loaded}
          onResolve={async (id, approve) => {
            await resolveCorrection(id, approve);
            await refresh();
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {ADMIN_LABELS.claims}
          {claims.length > 0 && ` (${claims.length})`}
        </h2>
        <ClaimReview
          claims={claims}
          loading={busy && !loaded}
          onDecide={async (id, approve) => {
            await decideClaim(id, approve);
            await refresh();
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {ADMIN_LABELS.reports}
          {reports.length > 0 && ` (${reports.length})`}
        </h2>
        <p className="text-xs text-ink-muted">{ADMIN_LABELS.removeWarning}</p>
        <ReportReview
          reports={reports}
          loading={busy && !loaded}
          onResolve={async (id, removePhoto) => {
            await resolveReport(id, removePhoto);
            await refresh();
          }}
        />
      </div>

      {/* Last, because it is the only section that is not a queue: nothing
          here is waiting on a decision. It is the page an admin scrolls to
          rather than the reason they opened it. */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {FEATURE_LABELS.title}
        </h2>
        <FeatureStatus />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">{USAGE_LABELS.title}</h2>
        <ApiUsagePanel />
      </div>
    </section>
  );
};

export default AdminConsole;
