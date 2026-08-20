import { type FC, type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import BottomSheet from "@/components/BottomSheet";
import { MENU_EDIT } from "@/customConstants";
import { MENU_EDIT_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";
import useMenuEditing from "@/customHooks/useMenuEditing";
import {
  AddDishActionInterface,
  AddDishFormInterface,
} from "@/interfaces/menu";

/**
 * "Add a dish we missed", at the end of the menu.
 *
 * **At the end, not the top.** Somebody arrives to decide what to order; the
 * food is the page. This is for the reader who has got to the bottom and can
 * see something is not there, which is a different person from the one who
 * just walked in.
 *
 * **It admits the gap is ours.** Menus here are read automatically and they
 * miss things, so "a dish we missed" is both true and the difference between
 * contributing and reporting a fault. Nobody files a bug against a menu.
 *
 * **Signed out, it is an invitation rather than a form that fails.** The one
 * hard requirement on a submission is that it attaches to somebody — an
 * anonymous menu editor is a menu nobody can hold to account.
 */
const AddDishForm: FC<AddDishFormInterface> = ({
  slug,
  sections,
  onClose,
  onAdded,
}) => {
  const { submitDish, error, clearError } = useMenuEditing();
  const [name, setName] = useState("");
  const [section, setSection] = useState(sections[0] ?? "");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);

  const handle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setSending(true);

    // Blank rather than zero. A missing price is an em dash everywhere in
    // this product, and sending 0 would make it "free".
    const parsed = price.trim()
      ? Number(price.replace(/[^0-9.]/g, ""))
      : null;

    const dish = await submitDish({
      slug,
      name: name.trim(),
      category: section.trim(),
      price: Number.isFinite(parsed as number) ? parsed : null,
      description: description.trim() || null,
    });

    setSending(false);

    if (dish) {
      onAdded?.(dish);
      onClose();
    }
  };

  const field =
    "h-12 w-full rounded-card border border-line bg-surface-raised px-3 text-base text-ink";

  return (
    <form onSubmit={handle} className="flex flex-col gap-4 pb-2">
      <p className="text-sm leading-relaxed text-ink-muted">
        {MENU_EDIT_LABELS.addIntro}
      </p>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink">
          {MENU_EDIT_LABELS.name}
        </span>
        <input
          required
          autoFocus
          value={name}
          maxLength={MENU_EDIT.MAX_NAME}
          onChange={(event) => setName(event.target.value)}
          placeholder={MENU_EDIT_LABELS.namePlaceholder}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink">
          {MENU_EDIT_LABELS.section}
        </span>
        {/* A free text box beside a list of sections that already exist.
            Offering only the existing ones refuses a dish in a section the
            extraction never found; offering only free text gets "Starters"
            standing beside "Small plates" on the same menu. */}
        <input
          required
          list="add-dish-sections"
          value={section}
          maxLength={MENU_EDIT.MAX_SECTION}
          onChange={(event) => setSection(event.target.value)}
          placeholder={MENU_EDIT_LABELS.sectionPlaceholder}
          className={field}
        />
        <datalist id="add-dish-sections">
          {sections.map((one) => (
            <option key={one} value={one} />
          ))}
        </datalist>
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium text-ink">
            {MENU_EDIT_LABELS.price}{" "}
            <span className="font-normal text-ink-muted">
              {MENU_EDIT_LABELS.priceHint}
            </span>
          </span>
          <input
            value={price}
            inputMode="decimal"
            onChange={(event) => setPrice(event.target.value)}
            placeholder="12.00"
            className={field}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink">
          {MENU_EDIT_LABELS.description}{" "}
          <span className="font-normal text-ink-muted">
            {MENU_EDIT_LABELS.descriptionHint}
          </span>
        </span>
        <textarea
          rows={3}
          value={description}
          maxLength={MENU_EDIT.MAX_DESCRIPTION}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-card border border-line bg-surface-raised px-3 py-2 text-base text-ink"
        />
      </label>

      {/* Verbatim. Each one explains a rule — that dish is already listed,
          you have several still waiting — and rewording them here would turn
          an explanation into "that did not work". */}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={sending || !name.trim() || !section.trim()}
          className="min-h-12 flex-1 rounded-pill bg-ink px-4 text-sm font-medium text-surface disabled:opacity-60"
        >
          {sending ? MENU_EDIT_LABELS.submitting : MENU_EDIT_LABELS.submit}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 rounded-pill px-4 text-sm text-ink-muted"
        >
          {MENU_EDIT_LABELS.cancel}
        </button>
      </div>
    </form>
  );
};

const AddDishAction: FC<AddDishActionInterface> = ({
  slug,
  sections,
  canContribute,
  onAdded,
}) => {
  const [open, setOpen] = useState(false);

  if (!canContribute) {
    return (
      <div className="flex flex-col items-center gap-1 py-6 text-center">
        <p className="text-sm text-ink-muted">{MENU_EDIT_LABELS.addIntro}</p>
        <Link
          to={ROUTES.signIn}
          className="min-h-11 text-sm font-medium text-ink underline underline-offset-4"
        >
          {MENU_EDIT_LABELS.signInFirst}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        /* Outlined rather than brand. Brand is the vote's colour, and this
           must not compete with it. */
        className="min-h-12 rounded-pill border border-line px-5 text-sm font-medium text-ink hover:bg-surface-sunken"
      >
        {MENU_EDIT_LABELS.addDish}
      </button>

      <BottomSheet
        open={open}
        title={MENU_EDIT_LABELS.addTitle}
        onClose={() => setOpen(false)}
      >
        {/* Remounted with the sheet, so a cancelled draft is not still
            sitting there the next time it opens. */}
        {open && (
          <AddDishForm
            slug={slug}
            sections={sections}
            onClose={() => setOpen(false)}
            onAdded={onAdded}
          />
        )}
      </BottomSheet>
    </div>
  );
};

export default AddDishAction;
