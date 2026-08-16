import { FC } from "react";
import DishCard from "@/components/DishCard";
import { TopDishStripInterface } from "@/interfaces/ranking";
import { RANKING_LABELS } from "@/customConstants/labels";

/**
 * The answer to "what should I order" in the first screenful, above the
 * category sections. Renders nothing when there is nothing worth recommending.
 */
const TopDishStrip: FC<TopDishStripInterface> = ({
  items,
  scores,
  votes,
  title = RANKING_LABELS.topStripTitle,
  canVote,
  onVote,
  onOpen,
  onAddPhoto,
  onVisible,
}) => {
  if (!items.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
        {items.map((item, index) => {
          const id = Number(item?.id ?? 0);

          return (
            <div
              key={id || `${item?.name}-${index}`}
              className="w-40 shrink-0 snap-start sm:w-48"
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
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TopDishStrip;
