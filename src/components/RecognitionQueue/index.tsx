import { type FC, useState } from "react";
import clsx from "clsx";
import {
  RECOGNITION_ADMIN_LABELS,
  RECOGNITION_KIND,
  RECOGNITION_STATUS,
  CURATABLE_AWARDS,
} from "@/customConstants/recognition";
import {
  AdminRecognitionType,
  RecognitionQueueInterface,
} from "@/interfaces/recognition";
import { recognitionLabel } from "@/utils/recognition";

/**
 * The recognitions on one restaurant, as moderation metadata.
 *
 * **Not an awards dashboard.** This is a short list with contextual actions,
 * the same shape as the queues beside it — a distinction is a fact about a
 * restaurant that somebody checked, not a product area of its own.
 *
 * **Every row says where it came from and when it was last looked at**,
 * because that is the whole basis on which it is allowed to be public. There
 * is no importer behind this: an OSM and Wikidata spike found roughly 13%
 * recall on current New York stars and live star statements for restaurants
 * that closed in 2013, so a person checks the source and signs for it.
 *
 * Our own signals appear here read-only. They are recomputed from activity on
 * every trending run, so a button to edit one would be a button that does
 * nothing by the next recompute.
 */
const RecognitionQueue: FC<RecognitionQueueInterface> = ({
  recognitions,
  loading,
  busyId,
  error,
  onAdd,
  onEdit,
  onVerify,
  onUnpublish,
  onExpire,
}) => {
  /**
   * The one form, in two modes.
   *
   * `null` is closed, an entry with no id is a new recognition, and an entry
   * with one is amending that row. Deliberately not a second component: they
   * are the same facts about the same thing, and two forms is two places for
   * the rules to drift apart — which is how a field ends up required when
   * adding and optional when editing.
   */
  const [form, setForm] = useState<{ id: string | null } | null>(null);
  const [award, setAward] = useState<string>(CURATABLE_AWARDS[0]);
  const [source, setSource] = useState("michelin");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [year, setYear] = useState("");
  const [notes, setNotes] = useState("");

  const openFor = (one: AdminRecognitionType | null) => {
    setAward(one?.award ?? CURATABLE_AWARDS[0]);
    setSource(one?.source ?? "michelin");
    setReferenceUrl(one?.reference_url ?? "");
    setYear(one?.year ? String(one.year) : "");
    setNotes(one?.internal_notes ?? "");
    setForm({ id: one?.id ?? null });
  };

  if (loading) {
    return (
      <p className="text-sm text-ink-muted">{RECOGNITION_ADMIN_LABELS.loading}</p>
    );
  }

  const submit = async () => {
    const fields = {
      award,
      source,
      referenceUrl,
      year: year ? Number(year) : null,
      internalNotes: notes || null,
    };

    await (form?.id ? onEdit(form.id, fields) : onAdd(fields));

    setForm(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        /* Server refusals verbatim: each one explains a rule — no source, no
           link, a duplicate edition — and rewording them here would turn an
           explanation into a failure message. */
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {recognitions.length === 0 && (
        <p className="text-sm text-ink-muted">{RECOGNITION_ADMIN_LABELS.empty}</p>
      )}

      <ul className="flex flex-col gap-2">
        {recognitions.map((one) => {
          const ours = one.kind === RECOGNITION_KIND.house;
          const busy = busyId === one.id;

          return (
            <li
              key={one.id}
              className="flex flex-col gap-1 rounded-card border border-line p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-ink">
                  {recognitionLabel(one.award) || one.award}
                </span>

                {/* Words, not a colour. Which state a row is in decides
                    whether it is public, and that must be readable without
                    relying on a tint. */}
                <span
                  className={clsx(
                    "text-xs font-medium",
                    one.status === RECOGNITION_STATUS.verified
                      ? "text-ink"
                      : "text-ink-muted",
                  )}
                >
                  {RECOGNITION_ADMIN_LABELS.status(one.status)}
                </span>
              </div>

              <p className="text-xs text-ink-muted">
                {[
                  one.source,
                  one.year ? String(one.year) : null,
                  one.verified_at
                    ? RECOGNITION_ADMIN_LABELS.lastChecked(one.verified_at)
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              {one.reference_url && (
                <a
                  href={one.reference_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs text-ink underline underline-offset-2"
                >
                  {RECOGNITION_ADMIN_LABELS.source}
                </a>
              )}

              {one.internal_notes && (
                <p className="text-xs italic text-ink-muted">
                  {one.internal_notes}
                </p>
              )}

              {ours ? (
                <p className="text-xs text-ink-muted">
                  {RECOGNITION_ADMIN_LABELS.ours}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openFor(one)}
                    className="min-h-9 rounded-pill border border-line px-3 text-xs text-ink disabled:opacity-60"
                  >
                    {RECOGNITION_ADMIN_LABELS.edit}
                  </button>

                  {one.status !== RECOGNITION_STATUS.verified && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onVerify(one.id)}
                      className="min-h-9 rounded-pill border border-ink px-3 text-xs font-medium text-ink disabled:opacity-60"
                    >
                      {RECOGNITION_ADMIN_LABELS.verify}
                    </button>
                  )}

                  {one.status === RECOGNITION_STATUS.verified && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onUnpublish(one.id)}
                      className="min-h-9 rounded-pill border border-line px-3 text-xs text-ink disabled:opacity-60"
                    >
                      {RECOGNITION_ADMIN_LABELS.unpublish}
                    </button>
                  )}

                  {one.status !== RECOGNITION_STATUS.expired && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onExpire(one.id)}
                      className="min-h-9 rounded-pill border border-line px-3 text-xs text-ink-muted disabled:opacity-60"
                    >
                      {RECOGNITION_ADMIN_LABELS.expire}
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {form ? (
        <div className="flex flex-col gap-2 rounded-card border border-line p-3">
          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            {RECOGNITION_ADMIN_LABELS.award}
            <select
              value={award}
              onChange={(event) => setAward(event.target.value)}
              className="min-h-9 rounded-card border border-line bg-surface-raised px-2 text-sm text-ink"
            >
              {CURATABLE_AWARDS.map((one) => (
                <option key={one} value={one}>
                  {recognitionLabel(one)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            {RECOGNITION_ADMIN_LABELS.provider}
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="min-h-9 rounded-card border border-line bg-surface-raised px-2 text-sm text-ink"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            {RECOGNITION_ADMIN_LABELS.reference}
            <input
              value={referenceUrl}
              onChange={(event) => setReferenceUrl(event.target.value)}
              placeholder="https://"
              className="min-h-9 rounded-card border border-line bg-surface-raised px-2 text-sm text-ink"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            {RECOGNITION_ADMIN_LABELS.year}
            <input
              value={year}
              inputMode="numeric"
              onChange={(event) => setYear(event.target.value)}
              className="min-h-9 rounded-card border border-line bg-surface-raised px-2 text-sm text-ink"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            {RECOGNITION_ADMIN_LABELS.notes}
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-9 rounded-card border border-line bg-surface-raised px-2 text-sm text-ink"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              className="min-h-9 rounded-pill border border-ink px-3 text-xs font-medium text-ink"
            >
              {RECOGNITION_ADMIN_LABELS.save}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="min-h-9 rounded-pill border border-line px-3 text-xs text-ink-muted"
            >
              {RECOGNITION_ADMIN_LABELS.cancel}
            </button>
          </div>

          {/* Said where somebody is about to publish an award: saving does
              not show it, and the tick is a person saying they checked.
              While amending a published one, the warning is the sharper of
              the two — changing what it says withdraws the verification,
              which takes the badge off the site until somebody looks again. */}
          <p className="text-xs text-ink-muted">
            {form.id
              ? RECOGNITION_ADMIN_LABELS.editingUnpublishes
              : RECOGNITION_ADMIN_LABELS.addingIsNotPublishing}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openFor(null)}
          className="self-start min-h-9 rounded-pill border border-line px-3 text-xs font-medium text-ink"
        >
          {RECOGNITION_ADMIN_LABELS.add}
        </button>
      )}
    </div>
  );
};

export default RecognitionQueue;
