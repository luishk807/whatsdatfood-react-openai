import { FC } from "react";
import clsx from "clsx";
import { FlameIcon } from "@/components/icons";
import { MenuItemType } from "@/interfaces/restaurants";
import {
  getDietaryTags,
  getSpiceLabel,
  isConfirmedByRestaurant,
  hasDietaryInfo,
} from "@/utils/dietary";
import { DIETARY_LABELS } from "@/customConstants/labels";

interface DietaryTagsInterface {
  item: MenuItemType;
  /** The disclaimer belongs wherever someone reads this properly, not on a tile. */
  showDisclaimer?: boolean;
}

/**
 * What is known about a dish's ingredients, and nothing more.
 *
 * Only explicit answers appear. A dish with no information shows nothing rather
 * than an all-clear, and there is no "nut free" tag anywhere — absence of a
 * warning must never be readable as a guarantee.
 */
const DietaryTags: FC<DietaryTagsInterface> = ({ item, showDisclaimer }) => {
  const tags = getDietaryTags(item);
  const spice = getSpiceLabel(item);

  if (!hasDietaryInfo(item)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <ul className="flex flex-wrap items-center gap-1">
        {tags.map((tag) => (
          <li
            key={tag.key}
            className={clsx(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              tag.tone === "warning"
                ? "bg-warn-soft text-warn"
                : "bg-brand-soft text-brand",
            )}
          >
            {tag.label}
          </li>
        ))}

        {spice && (
          <li className="inline-flex items-center gap-0.5 rounded-full bg-spice-soft px-2 py-0.5 text-[11px] font-medium text-spice">
            <FlameIcon size={12} />
            {spice}
          </li>
        )}

        {isConfirmedByRestaurant(item) && (
          <li className="text-[11px] text-ink-muted">
            {DIETARY_LABELS.confirmedByRestaurant}
          </li>
        )}
      </ul>

      {showDisclaimer && (
        <p className="text-[11px] text-ink-muted">
          {DIETARY_LABELS.disclaimer}
        </p>
      )}
    </div>
  );
};

export default DietaryTags;
