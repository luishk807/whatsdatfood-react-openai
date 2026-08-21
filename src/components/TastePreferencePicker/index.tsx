import { type FC, useMemo } from "react";
import clsx from "clsx";
import { CheckIcon } from "@/components/icons";
import { foodCategoryIcon } from "@/customConstants/foodIcons";
import { TASTE_LABELS } from "@/customConstants/labels";
import { TASTE_PICKER } from "@/customConstants/tastes";
import { groupCategories } from "@/utils/tastes";
import { TastePreferencePickerInterface } from "@/interfaces/tastes";

/**
 * "What are you into?" — the one picker, used everywhere.
 *
 * **One component, two placements.** The homepage card and the account page
 * differ by a heading and a Skip button, and that is all `variant` decides.
 * Two implementations would drift the moment a category was added, and the
 * account page is where somebody goes to fix what the homepage got wrong —
 * they had better be the same control.
 *
 * **Chips, not checkboxes, and never a 1-5 rating.** The statement being
 * collected is "I am interested in this", which is one bit. Asking somebody to
 * rate fourteen categories out of five is a questionnaire, and this feature
 * exists specifically not to be one — it has to be answerable in the time
 * between sitting down and opening a menu.
 *
 * **Selection is obvious without relying on colour**: a chip that is chosen
 * gains a border, a filled ground and a tick. Colour alone fails for the
 * reader it most matters to, and this is a grid of seventeen small targets.
 *
 * **Nothing here is required.** No minimum is enforced, Skip is always
 * available in onboarding, and an empty save is valid — somebody who wants no
 * personalisation has to be able to say so.
 */
const TastePreferencePicker: FC<TastePreferencePickerInterface> = ({
  categories,
  selected,
  onChange,
  onSave,
  onSkip,
  loading,
  saving,
  error,
  saved,
  variant = "onboarding",
}) => {
  const groups = useMemo(() => groupCategories(categories), [categories]);
  const onboarding = variant === "onboarding";

  const toggle = (slug: string) =>
    onChange(
      selected.includes(slug)
        ? selected.filter((one) => one !== slug)
        : [...selected, slug],
    );

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((one) => (
          <div
            key={one}
            className="h-16 animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  // Nothing to offer is a complete answer, and silence is the right one: an
  // empty picker under a heading looks like a section that failed to load.
  if (!categories.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="taste-picker"
      className={clsx(
        "flex flex-col gap-3",
        onboarding && "rounded-card border border-line bg-surface-raised p-4",
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h2 id="taste-picker" className="text-base font-semibold text-ink">
          {TASTE_LABELS.title}
        </h2>
        <p className="text-sm text-ink-muted">{TASTE_LABELS.blurb}</p>
      </div>

      {groups.map((group) => (
        <div key={group.kind} className="flex flex-col gap-1.5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {TASTE_LABELS.group(group.kind)}
          </h3>

          {/* Two columns on a phone with targets big enough for a thumb;
              more as the width allows. A chip row that wraps to one item per
              line reads as a list of settings rather than a menu of food. */}
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {group.categories.map((category) => {
              const Glyph = foodCategoryIcon(category.slug);
              const chosen = selected.includes(category.slug);

              return (
                <li key={category.slug}>
                  <button
                    type="button"
                    // The control *is* the state, so it is a toggle rather
                    // than a button that happens to look pressed. A screen
                    // reader is told "Coffee, selected" without any extra
                    // label.
                    aria-pressed={chosen}
                    onClick={() => toggle(category.slug)}
                    className={clsx(
                      "flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-card border px-2 py-3 text-center text-sm transition-colors",
                      chosen
                        ? "border-ink bg-surface-sunken font-medium text-ink"
                        : "border-line bg-surface text-ink-muted hover:border-ink/40 hover:text-ink",
                    )}
                  >
                    <span className="relative">
                      <Glyph size={22} />
                      {/* Shape as well as colour: a tick is legible to a
                          reader for whom the tinted ground is not. */}
                      {chosen && (
                        <span className="absolute -right-2.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-surface">
                          <CheckIcon size={11} />
                        </span>
                      )}
                    </span>
                    <span className="line-clamp-2 leading-tight">
                      {category.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Advice, not a rule. Enforcing a minimum turns a two-second choice
          into a form with a validation error. */}
      {selected.length < TASTE_PICKER.SUGGESTED && (
        <p className="text-xs text-ink-muted">
          {TASTE_LABELS.suggestion(TASTE_PICKER.SUGGESTED)}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {saved && !error && (
        <p role="status" className="text-sm text-ink-muted">
          {TASTE_LABELS.saved}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="min-h-11 rounded-pill bg-brand px-5 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? TASTE_LABELS.saving : TASTE_LABELS.save}
        </button>

        {/* Onboarding only. Somebody who navigated to a settings page has
            already decided to be there and leaves with the back button. */}
        {onboarding && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="min-h-11 text-sm text-ink-muted underline underline-offset-2 hover:text-ink"
          >
            {TASTE_LABELS.skip}
          </button>
        )}
      </div>

      {/* Says what this is for, and what it is not for. Choosing a taste must
          never read as publishing where somebody is. */}
      <p className="text-xs text-ink-muted">{TASTE_LABELS.why}</p>
    </section>
  );
};

export default TastePreferencePicker;
