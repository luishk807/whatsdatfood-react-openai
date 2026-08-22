import { type FC, useCallback, useEffect, useState } from "react";
import useAdminQueues from "@/customHooks/useAdminQueues";
import useMenuCorrections from "@/customHooks/useMenuCorrections";
import ApiUsagePanel from "@/components/ApiUsagePanel";
import RecognitionQueue from "@/components/RecognitionQueue";
import useRecognitionAdmin from "@/customHooks/useRecognitionAdmin";
import { RECOGNITION_ADMIN_LABELS } from "@/customConstants/recognition";
import FeatureStatus from "@/components/FeatureStatus";
import CorrectionQueue from "@/components/CorrectionQueue";
import DishSubmissionQueue from "@/components/DishSubmissionQueue";
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
  MENU_EDIT_LABELS,
  CORRECTION_LABELS,
  FEATURE_LABELS,
  USAGE_LABELS,
} from "@/customConstants/labels";
import { ACCOUNT_TYPE } from "@/customConstants";
import useMenuEditing from "@/customHooks/useMenuEditing";
import { ManagedDishType } from "@/interfaces/menu";

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
  const [lookingUp, setLookingUp] = useState("");
  const recognition = useRecognitionAdmin();
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
  const {
    loadPendingDishes,
    decideDish,
    pendingLoading,
  } = useMenuEditing();
  const [submissions, setSubmissions] = useState<ManagedDishType[]>([]);
  const [loaded, setLoaded] = useState(false);

  const isAdmin = String(user?.role_id ?? "") === ACCOUNT_TYPE.admin;

  const refresh = useCallback(async () => {
    if (!isAdmin) {
      return;
    }

    setClaims(await loadClaims());
    setReports(await loadReports());
    setCorrections(await loadCorrections());
    setSubmissions(await loadPendingDishes());
    setLoaded(true);
  }, [isAdmin, loadClaims, loadReports, loadCorrections, loadPendingDishes]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!isAdmin) {
    // Not nothing. A blank page under a heading reads as a page that failed.
    return <p className="text-sm text-ink-muted">{ADMIN_LABELS.notForYou}</p>;
  }

  const busy = loading || correctionsLoading || pendingLoading;
  const waiting =
    corrections.length + submissions.length + claims.length + reports.length;

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

      {/* Submissions first: a dish somebody added is already on the menu,
          labelled, so this is the only queue where waiting has a cost a
          reader can see. */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {MENU_EDIT_LABELS.queueTitle}
          {submissions.length > 0 && ` (${submissions.length})`}
        </h2>
        <DishSubmissionQueue
          submissions={submissions}
          loading={pendingLoading && !loaded}
          onDecide={async (dishId, approve) => {
            await decideDish(dishId, approve);
            await refresh();
          }}
        />
      </div>

      {/* Corrections next: they are the cheapest decision here and the one
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

      {/* Below the queues, because nothing here is waiting on a decision:
          a recognition is looked up when somebody has a restaurant in mind,
          rather than arriving in a list that needs working through. */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">
          {RECOGNITION_ADMIN_LABELS.title}
        </h2>

        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void recognition.open(lookingUp.trim());
          }}
        >
          <label className="flex flex-1 flex-col gap-1 text-xs text-ink-muted">
            {RECOGNITION_ADMIN_LABELS.restaurant}
            <input
              value={lookingUp}
              onChange={(event) => setLookingUp(event.target.value)}
              className="min-h-9 rounded-card border border-line bg-surface-raised px-2 text-sm text-ink"
            />
          </label>
          <button
            type="submit"
            className="min-h-9 rounded-pill border border-line px-3 text-xs font-medium text-ink"
          >
            {RECOGNITION_ADMIN_LABELS.look}
          </button>
        </form>

        {recognition.opened && (
          <RecognitionQueue
            recognitions={recognition.recognitions}
            loading={recognition.loading}
            busyId={recognition.busyId}
            error={recognition.error}
            onAdd={recognition.add}
            onVerify={recognition.verify}
            onUnpublish={recognition.unpublish}
            onExpire={recognition.expire}
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">{USAGE_LABELS.title}</h2>
        <ApiUsagePanel />
      </div>
    </section>
  );
};

export default AdminConsole;
