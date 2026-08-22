import { type FC } from "react";
import { CameraIcon } from "@/components/icons";
import { MENU_MISSING_LABELS } from "@/customConstants/labels";
import { MenuMissingInterface } from "@/interfaces/menu";

/**
 * What a restaurant page shows when there is no menu.
 *
 * **The ordinary case, designed as one.** Most restaurants in the world do
 * not publish a menu online, and on this catalogue that is the majority — so
 * this is not an error, not a spinner that gave up, and not "0 dishes". A
 * page that reads as broken is a page nobody contributes to, and contribution
 * is the only thing that fills this gap.
 *
 * **It names the absence and then asks.** Two actions, both of which somebody
 * standing in the restaurant can do in under a minute: photograph the menu on
 * the wall, or add the one dish they ordered. Nobody is asked to reconstruct
 * a whole menu — that is the ask that gets ignored, and it is not what this
 * product is for. What it is for is what the food actually looks like.
 *
 * **Nothing here mentions extraction.** The reader does not need to know that
 * a model returned nothing; they need to know the menu is missing and that
 * they can help. `zero_valid_dishes` is our vocabulary, not theirs.
 *
 * The claim prompt is deliberately not here. It already exists further down
 * the page and belongs to the restaurant rather than to the reader, and two
 * asks stacked together make both easier to skip.
 */
const MenuMissing: FC<MenuMissingInterface> = ({ onAddPhoto, uploading }) => (
  <section
    aria-labelledby="menu-missing"
    className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface-raised px-6 py-10 text-center"
  >
    <h2 id="menu-missing" className="text-base font-semibold text-ink">
      {MENU_MISSING_LABELS.title}
    </h2>

    <p className="max-w-sm text-sm text-ink-muted">
      {MENU_MISSING_LABELS.body}
    </p>

    {/* Camera-first where it exists: the person who can answer this is
        holding a phone in front of the menu. Rendered only when there is
        somewhere to send the photograph — a button that opens a camera and
        then fails spends somebody's goodwill on a dead end.

        The dish contribution is not duplicated here. `AddDishAction` sits
        directly below with its own control and sheet, already worded for a
        restaurant with no menu, and a second button doing the same thing is
        two things to keep in step. */}
    {onAddPhoto && (
      <>
        <button
          type="button"
          onClick={onAddPhoto}
          disabled={uploading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-ink px-4 text-sm font-medium text-ink hover:bg-surface-sunken disabled:opacity-60"
        >
          <CameraIcon size={16} />
          {MENU_MISSING_LABELS.photo}
        </button>

        <p className="max-w-sm text-xs text-ink-muted">
          {MENU_MISSING_LABELS.photoHint}
        </p>
      </>
    )}

    <p className="max-w-sm text-sm text-ink">{MENU_MISSING_LABELS.invite}</p>
  </section>
);

export default MenuMissing;
