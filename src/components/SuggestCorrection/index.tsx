import { useState, type FC } from "react";
import { CORRECTABLE_FIELDS } from "@/customConstants";
import { CORRECTION_LABELS } from "@/customConstants/labels";
import { SuggestCorrectionInterface } from "@/interfaces/corrections";
import useMenuCorrections from "@/customHooks/useMenuCorrections";

/**
 * "Something wrong here?" in the dish sheet.
 *
 * The menus are extracted by a language model, so they are wrong in ordinary
 * ways — a missing description, a price that never made it across. The person
 * who can see that is sitting in front of the dish, and until now had no way
 * to say so.
 *
 * Collapsed by default. This is a repair tool, not a call to action: it must
 * not compete with the photograph or the vote, which are what the sheet is
 * for. It opens only for somebody who already thinks something is wrong.
 *
 * The field list deliberately omits allergens, and says so. They are the
 * biggest gap in the data and the obvious thing to crowdsource — and the one
 * field where being wrong can hurt somebody.
 */
const SuggestCorrection: FC<SuggestCorrectionInterface> = ({
  dishId,
  canSuggest,
  onSubmitted,
}) => {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<string>(CORRECTABLE_FIELDS[0].value);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { suggest, error, clearError } = useMenuCorrections();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-xs text-ink-muted underline underline-offset-2 hover:text-ink"
      >
        {CORRECTION_LABELS.open}
      </button>
    );
  }

  if (sent) {
    return (
      <p className="text-xs text-ink-muted">{CORRECTION_LABELS.sent}</p>
    );
  }

  if (!canSuggest) {
    return <p className="text-xs text-ink-muted">{CORRECTION_LABELS.signIn}</p>;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!value.trim()) {
      return;
    }

    setSending(true);
    const ok = await suggest(dishId, field, value.trim());
    setSending(false);

    if (ok) {
      setSent(true);
      onSubmitted?.();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-card border border-line bg-surface-sunken p-3"
    >
      <p className="text-xs font-semibold text-ink">
        {CORRECTION_LABELS.title}
      </p>
      {/* Said up front, because a suggestion that looked like an edit and then
          did not change anything reads as a broken button. */}
      <p className="text-[11px] text-ink-muted">{CORRECTION_LABELS.blurb}</p>

      <label className="flex flex-col gap-1 text-[11px] text-ink-muted">
        {CORRECTION_LABELS.field}
        <select
          value={field}
          onChange={(e) => {
            setField(e.target.value);
            clearError();
          }}
          className="rounded-md border border-line bg-surface-raised px-2 py-1.5 text-sm text-ink"
        >
          {CORRECTABLE_FIELDS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <p className="text-[11px] text-ink-muted">
        {CORRECTION_LABELS.dietaryNote}
      </p>

      <label className="flex flex-col gap-1 text-[11px] text-ink-muted">
        {CORRECTION_LABELS.value}
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            clearError();
          }}
          className="rounded-md border border-line bg-surface-raised px-2 py-1.5 text-sm text-ink"
        />
      </label>

      {/* Verbatim from the server. Every refusal it produces explains a rule —
          a duplicate already queued, an allergen field, an unparseable price —
          and rewording them here would lose that. */}
      {error && <p className="text-[11px] text-danger">{error}</p>}

      <button
        type="submit"
        disabled={sending || !value.trim()}
        className="self-start rounded-pill border border-line bg-surface-raised px-3 py-1.5 text-xs font-semibold text-ink hover:border-ink hover:bg-ink hover:text-surface disabled:opacity-50"
      >
        {sending ? CORRECTION_LABELS.sending : CORRECTION_LABELS.submit}
      </button>
    </form>
  );
};

export default SuggestCorrection;
