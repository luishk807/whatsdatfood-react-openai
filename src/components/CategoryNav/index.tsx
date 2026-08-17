import { FC, useEffect, useRef } from "react";
import clsx from "clsx";
import { CategoryNavInterface } from "@/interfaces/ranking";

/**
 * Jump straight to a part of the menu.
 *
 * A tasting-menu restaurant has fifty dishes across eight categories, and
 * somebody standing inside it wanting dessert should not have to scroll past
 * all of them. Sticky, because the moment it scrolls away it stops being
 * navigation and becomes a heading.
 *
 * Chips rather than a select: on a phone the whole point is one thumb and no
 * dialog, and a swipeable row shows what the categories are without opening
 * anything.
 */
const CategoryNav: FC<CategoryNavInterface> = ({
  sections,
  activeId,
  onJump,
}) => {
  const barRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Scrolling the page moves the highlight, and the highlighted chip has to
  // stay on screen or the bar starts lying about where the reader is.
  //
  // This sets the rail's own scrollLeft rather than calling scrollIntoView on
  // the chip. scrollIntoView scrolls every ancestor that can scroll, including
  // the page: tapping the last category started the page moving, the highlight
  // changed on the way, and this effect then hauled the page back - a jump to
  // Dessert landed 198px down and stayed there.
  useEffect(() => {
    const chip = activeRef.current;
    const bar = barRef.current;

    if (!chip || !bar) {
      return;
    }

    const chipBox = chip.getBoundingClientRect();
    const barBox = bar.getBoundingClientRect();

    if (chipBox.left >= barBox.left && chipBox.right <= barBox.right) {
      return;
    }

    const offset = chipBox.left - barBox.left;
    const centred = offset - (barBox.width - chipBox.width) / 2;

    bar.scrollTo({
      left: Math.max(0, bar.scrollLeft + centred),
      behavior: "smooth",
    });
  }, [activeId]);

  if (sections.length < 2) {
    // One category is not a menu to navigate; the bar would only take up the
    // space the food should have.
    return null;
  }

  return (
    <nav
      aria-label="Menu sections"
      className="sticky top-0 z-20 -mx-4 border-b border-line bg-surface/95 px-4 backdrop-blur-sm"
    >
      <div
        ref={barRef}
        className="no-scrollbar flex gap-2 overflow-x-auto py-2.5"
      >
        {sections.map((section) => {
          const active = section.id === activeId;

          return (
            <button
              key={section.id}
              ref={active ? activeRef : undefined}
              type="button"
              // Pressed rather than current: this is a control that moves the
              // page, and a screen reader should hear which one is selected.
              aria-current={active ? "true" : undefined}
              onClick={() => onJump(section.id)}
              className={clsx(
                "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none",
                active
                  ? "border-ink bg-ink text-surface"
                  : "border-line text-ink-muted hover:border-ink hover:text-ink",
              )}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryNav;
