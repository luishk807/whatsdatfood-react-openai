import { type FC } from "react";
import clsx from "clsx";
import { DISH_SOURCE, DISH_VERIFICATION } from "@/customConstants";
import { MENU_EDIT_LABELS } from "@/customConstants/labels";
import { DishProvenanceInterface } from "@/interfaces/menu";

/**
 * What a dish says about where it came from — and usually nothing at all.
 *
 * **Silence is the default and the common case.** Almost every dish in this
 * product was read off a menu by a language model, and a badge saying so on
 * every card is a badge on none of them: it stops being read by the second
 * screenful and it makes the page look like a database rather than a menu.
 * So an extracted, available, unremarkable dish renders nothing.
 *
 * A label appears only where it changes what a reader should believe:
 *
 * - **not available** — the one that changes an order. Loudest of the three,
 *   because reading it after ordering is too late.
 * - **confirmed by the restaurant** — the strongest claim in the product, and
 *   rare enough to be worth the space.
 * - **added by a diner** — a person put this here, and if it is wrong that is
 *   who was wrong. Named where we know the name: a contribution with somebody
 *   standing behind it reads differently from an anonymous one.
 *
 * A pending dish is shown on the menu rather than hidden, so it has to say
 * that it is pending. Hiding it until review means the diner who added it
 * watches nothing happen, and on a menu that is mostly empty the contribution
 * is the point.
 */
const DishProvenance: FC<DishProvenanceInterface> = ({
  source,
  verification_status: status,
  is_available: available = true,
  added_by: addedBy,
  compact,
}) => {
  const chip =
    "inline-flex items-center rounded-pill px-2 py-0.5 text-[11px] font-medium leading-tight";

  // Ordered by what a reader needs first. Only one of these ever shows: two
  // chips on a card is the beginning of a badge shelf.
  if (!available) {
    return (
      <span className={clsx(chip, "bg-warn-soft text-warn")}>
        {MENU_EDIT_LABELS.unavailable}
      </span>
    );
  }

  if (status === DISH_VERIFICATION.pending) {
    return (
      <span className={clsx(chip, "bg-surface-sunken text-ink-muted")}>
        {MENU_EDIT_LABELS.pending}
      </span>
    );
  }

  if (status === DISH_VERIFICATION.ownerVerified) {
    return (
      <span className={clsx(chip, "bg-surface-sunken text-ink")}>
        {MENU_EDIT_LABELS.ownerVerified}
      </span>
    );
  }

  if (source === DISH_SOURCE.community) {
    return (
      <span className={clsx(chip, "bg-surface-sunken text-ink-muted")}>
        {compact || !addedBy
          ? MENU_EDIT_LABELS.community
          : MENU_EDIT_LABELS.communityBy(addedBy)}
      </span>
    );
  }

  // Extracted, available, unremarkable. Which is most of the catalogue, and
  // saying so on every card would drown out the three above.
  return null;
};

export default DishProvenance;
