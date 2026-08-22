import { type FC } from "react";
import {
  MENU_AVAILABILITY,
  MENU_AVAILABILITY_LABELS,
} from "@/customConstants/labels";
import { MenuProvenanceInterface } from "@/interfaces/menu";

/**
 * Whose menu this is, said once.
 *
 * **Only where the distinction matters.** A restaurant that has spoken for
 * itself gets no qualifier at all — "Menu" unqualified is exactly right, and
 * a badge reading "official" would make every other menu look suspect by
 * contrast. Everything else says whose information it is, because an
 * incomplete list presented as *the* menu is the one mistake this product
 * cannot afford: somebody orders from it.
 *
 * **Once, under the heading — never on every dish.** Provenance per card
 * would put a label on all of them, which is a label on none of them, and it
 * would crowd out the photograph that is the actual point.
 */
const MenuProvenance: FC<MenuProvenanceInterface> = ({ availability }) => {
  const note = MENU_AVAILABILITY_LABELS[availability];

  if (!note || availability === MENU_AVAILABILITY.official) {
    return null;
  }

  return <p className="text-xs text-ink-muted">{note}</p>;
};

export default MenuProvenance;
