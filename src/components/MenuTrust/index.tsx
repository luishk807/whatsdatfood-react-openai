import { type FC } from "react";
import { CheckCircleIcon } from "@/components/icons";
import { MENU_EDIT_LABELS } from "@/customConstants/labels";
import { MenuTrustInterface } from "@/interfaces/menu";
import { relativeDay } from "@/utils/time";

/**
 * One line under the restaurant's name saying how much to trust its menu.
 *
 * **Menu level, not dish level.** The alternative is a badge on every card,
 * and a menu where two thirds of the tiles already carry an empty-photo
 * prompt cannot afford a second row of chrome on each one. This says it once,
 * where somebody reads the restaurant's name and decides whether to scroll.
 *
 * **Nothing when nothing has happened**, which is almost every restaurant.
 * "Menu last updated: never" is worse than silence — it draws attention to an
 * absence the reader was not worried about, in the one place they are
 * deciding whether to trust the page at all.
 *
 * Confirmed outranks updated, and only one of them shows: a restaurant that
 * confirmed its menu and then fixed a price has said the stronger thing
 * already.
 */
const MenuTrust: FC<MenuTrustInterface> = ({ verifiedAt, updatedAt }) => {
  if (verifiedAt) {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink">
        <CheckCircleIcon size={14} />
        {MENU_EDIT_LABELS.menuVerified}
      </p>
    );
  }

  if (!updatedAt) {
    return null;
  }

  const when = relativeDay(updatedAt);

  if (!when) {
    return null;
  }

  return (
    <p className="text-xs text-ink-muted">
      {MENU_EDIT_LABELS.menuUpdated(when)}
    </p>
  );
};

export default MenuTrust;
