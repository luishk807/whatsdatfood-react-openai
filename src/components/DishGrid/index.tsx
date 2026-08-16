import { FC } from "react";
import DishCard from "@/components/DishCard";
import { DishGridInterface } from "@/interfaces/ranking";

/**
 * Two columns on a phone: enough photos per screen to scan a menu quickly
 * while each one stays big enough to actually tell what the dish is.
 */
const DishGrid: FC<DishGridInterface> = ({
  items,
  scores,
  votes,
  eagerCount = 4,
  canVote,
  onVote,
  onOpen,
  onAddPhoto,
  onVisible,
}) => (
  <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
    {items.map((item, index) => {
      const id = Number(item?.id ?? 0);

      return (
        <DishCard
          key={id || `${item?.name}-${index}`}
          item={item}
          score={scores?.[id]}
          vote={votes?.[id]}
          eager={index < eagerCount}
          canVote={canVote}
          onVote={onVote}
          onOpen={onOpen}
          onAddPhoto={onAddPhoto}
          onVisible={onVisible}
        />
      );
    })}
  </div>
);

export default DishGrid;
