import { FC, useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DishCard from "@/components/DishCard";
import { TopDishStripInterface } from "@/interfaces/ranking";
import { RANKING_LABELS } from "@/customConstants/labels";

/** Roughly one card plus its gap, so a nudge lands on a card edge. */
const STEP = 200;

/**
 * The answer to "what should I order", above the categories.
 *
 * Renders nothing when there is nothing worth recommending — and the caller is
 * expected not to render it at all in that case, because a heading claiming
 * recommendations over an empty strip is worse than no section.
 */
const TopDishStrip: FC<TopDishStripInterface> = ({
  items,
  scores,
  votes,
  title = RANKING_LABELS.topStripTitle,
  subtitle = RANKING_LABELS.topStripSubtitle,
  id,
  canVote,
  onVote,
  onOpen,
  onAddPhoto,
  onVisible,
  uploadingDishId,
  dinerCount,
}) => {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const measure = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const max = rail.scrollWidth - rail.clientWidth;

    setAtStart(rail.scrollLeft <= 1);
    // A strip that fits needs no arrows at all, which this also covers: max is
    // 0, so both ends are true and neither arrow renders.
    setAtEnd(rail.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    measure();
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    rail.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      rail.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure, items.length]);

  const nudge = (direction: -1 | 1) =>
    railRef.current?.scrollBy({ left: direction * STEP, behavior: "smooth" });

  if (!items.length) {
    return null;
  }

  return (
    <section id={id} className="flex scroll-mt-16 flex-col gap-1">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}

      <div className="relative mt-2">
        {/* The scrollbar is hidden rather than the overflow removed: a phone
            swipes this and draws no bar anyway, while on desktop a full-width
            grey bar under the food read as a desktop window control. The partly
            visible next card is the affordance. */}
        {/* scroll-pl-4 matters: snap-start aligns a card with the scrollport
            edge, which sits inside the padding, so the rail loaded already
            scrolled 16px and clipped the first card. Scroll padding is what snap
            measures from. */}
        <div
          ref={railRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-1"
        >
          {items.map((item, index) => {
            const id = Number(item?.id ?? 0);

            return (
              <div
                key={id || `${item?.name}-${index}`}
                className="w-36 shrink-0 snap-start sm:w-44"
              >
                <DishCard
                  item={item}
                  score={scores?.[id]}
                  vote={votes?.[id]}
                  eager={index < 3}
                  canVote={canVote}
                  onVote={onVote}
                  onOpen={onOpen}
                  onAddPhoto={onAddPhoto}
                  onVisible={onVisible}
                  uploadingDishId={uploadingDishId}
                  dinerCount={dinerCount}
                  // The heading already says these are the most loved dishes.
                  hideRankBadge
                />
              </div>
            );
          })}
        </div>

        {/* Pointer devices only. A touch screen scrolls the rail directly, so an
            arrow there is a target competing with the photographs for a thumb
            that was going to swipe anyway. */}
        {[-1, 1].map((direction) => {
          const hidden = direction === -1 ? atStart : atEnd;

          return (
            <button
              key={direction}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => nudge(direction as -1 | 1)}
              className={clsx(
                "absolute top-[38%] hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface-raised text-ink-muted shadow-sm transition-opacity hover:text-ink motion-reduce:transition-none",
                !hidden && "sm:flex",
                direction === -1 ? "-left-1" : "-right-1",
              )}
            >
              {direction === -1 ? (
                <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default TopDishStrip;
