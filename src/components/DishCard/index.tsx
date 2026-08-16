import { FC, useCallback } from "react";
import DishPhoto from "@/components/DishPhoto";
import Badge from "@/components/Badge";
import VoteButton from "@/components/VoteButton";
import { DishCardInterface } from "@/interfaces/ranking";
import { convertCurrency } from "@/utils/numbers";
import { getDishPhotoUrl, getDishPhotoSource } from "@/utils/dish";
import { BADGE_TONE } from "@/customConstants/images";
import { DISH_LABELS, RANKING_LABELS } from "@/customConstants/labels";
import { VoteValue } from "@/types";

/**
 * The atom of the menu. Photo dominant, then name, then price and the vote —
 * in the order someone deciding what to order actually reads them.
 */
const DishCard: FC<DishCardInterface> = ({
  item,
  score,
  vote,
  eager,
  canVote,
  onVote,
  onOpen,
  onAddPhoto,
  onVisible,
}) => {
  const url = getDishPhotoUrl(item);
  const source = getDishPhotoSource(item);
  const showTopBadge = score?.isRanked || item.top_choice;

  const handleVote = (value: VoteValue) => onVote && onVote(item, value);

  // Memoised so the photo tile's observer is not torn down every render.
  const handleVisible = useCallback(
    () => onVisible && onVisible(item),
    [onVisible, item],
  );

  return (
    <article className="flex flex-col gap-2">
      <div className="relative">
        {onOpen ? (
          <button
            type="button"
            onClick={() => onOpen(item)}
            aria-label={item.name}
            className="block w-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <DishPhoto
              url={url}
              alt={item.name}
              source={source}
              eager={eager}
              onAddPhoto={onAddPhoto ? () => onAddPhoto(item) : undefined}
              onVisible={onVisible ? handleVisible : undefined}
            />
          </button>
        ) : (
          <DishPhoto
            url={url}
            alt={item.name}
            source={source}
            eager={eager}
            onAddPhoto={onAddPhoto ? () => onAddPhoto(item) : undefined}
            onVisible={onVisible ? handleVisible : undefined}
          />
        )}

        {showTopBadge && (
          <div className="pointer-events-none absolute right-2 top-2">
            <Badge tone={score?.isRanked ? BADGE_TONE.top : BADGE_TONE.neutral}>
              {score?.isRanked
                ? RANKING_LABELS.topStripTitle
                : DISH_LABELS.popularUnverified}
            </Badge>
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
        {item.name}
      </h3>

      {/* Below the vote threshold we show the count, never a rank — a wrong
          "top dish" costs more trust than saying nothing. */}
      {score && score.voteCount > 0 && !score.isRanked && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {RANKING_LABELS.voteCount(score.voteCount)}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        {item.price !== undefined && item.price !== null ? (
          <span className="text-sm tabular-nums text-neutral-700 dark:text-neutral-300">
            {convertCurrency(Number(item.price))}
          </span>
        ) : (
          <span />
        )}

        <VoteButton
          value={vote}
          disabled={!canVote}
          onVote={onVote ? handleVote : undefined}
        />
      </div>
    </article>
  );
};

export default DishCard;
