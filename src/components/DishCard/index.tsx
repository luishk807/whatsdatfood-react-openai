import { FC, useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import DishPhoto from "@/components/DishPhoto";
import Badge from "@/components/Badge";
import VoteButton from "@/components/VoteButton";
import DietaryTags from "@/components/DietaryTags";
import { DishCardInterface } from "@/interfaces/ranking";
import { convertCurrency } from "@/utils/numbers";
import {
  getDishPhotoUrl,
  getDishPhotoSource,
  getDishPhotoCredit,
  dishPrice,
} from "@/utils/dish";
import { BADGE_TONE } from "@/customConstants/images";
import {
  DISH_LABELS,
  RANKING_LABELS,
  ORDER_LABELS,
} from "@/customConstants/labels";
import { shareOfDiners } from "@/utils/orders";
import { recommendShare } from "@/utils/ranking";
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
  uploadingDishId,
  dinerCount,
  hideRankBadge,
}) => {
  const url = getDishPhotoUrl(item);
  const source = getDishPhotoSource(item);
  const credit = getDishPhotoCredit(item);
  const uploading = Number(item?.id ?? 0) === Number(uploadingDishId ?? -1);
  // Only an earned badge. It used to fall back to the AI's top_choice flag and
  // label it "Popular", so dishes nobody had voted on were badged as popular on
  // a page whose own heading admitted there were no votes.
  const showTopBadge = !!score?.isRanked && !hideRankBadge;
  const orderShare = shareOfDiners(item.order_count, dinerCount);
  const share = recommendShare(item);
  const price = dishPrice(item);

  // The thumb is the ranking mechanism, so it carries the number: a share once
  // there are enough votes to have one, otherwise the raw count.
  const metric =
    share !== null
      ? `${share}%`
      : score?.voteCount
        ? String(score.voteCount)
        : undefined;

  const handleVote = (value: VoteValue) => onVote && onVote(item, value);

  // Memoised so the photo tile's observer is not torn down every render.
  const handleVisible = useCallback(
    () => onVisible && onVisible(item),
    [onVisible, item],
  );

  // The tile had a URL but the host refused it, so it is now an empty tile and
  // must stop pretending it can open a detail sheet.
  const [unavailable, setUnavailable] = useState(false);
  const handleUnavailable = useCallback(() => setUnavailable(true), []);

  useEffect(() => {
    setUnavailable(false);
  }, [url]);

  return (
    // Full height with the footer pushed down, so that in a grid every card's
    // price and vote line up across the row however long the dish names are.
    <article className="flex h-full flex-col gap-2">
      <div className="relative">
        <DishPhoto
          url={url}
          alt={item.name}
          source={source}
          eager={eager}
          onAddPhoto={onAddPhoto ? (file) => onAddPhoto(item, file) : undefined}
          credit={credit}
          uploading={uploading}
          onVisible={onVisible ? handleVisible : undefined}
          onUnavailable={handleUnavailable}
          // A card is 140-176px wide. The full ask belongs in the dish sheet,
          // where there is room for a sentence.
          compact
        />

        {/* A sibling overlay rather than a wrapper, so the upload button an
            empty tile carries can never end up inside this one.

            Wrapping was the obvious shape and it was wrong: a third-party host
            returning 403 turns a tile that had a URL into an empty one, and the
            commit that swaps in the upload button still has the wrapper around
            it. Reacting to that after the fact cannot help - the invalid DOM has
            already been rendered once. Siblings are valid in every frame. */}
        {onOpen && url && !unavailable && (
          <button
            type="button"
            onClick={() => onOpen(item)}
            aria-label={item.name}
            className="absolute inset-0 rounded-card"
          />
        )}

        {showTopBadge && (
          <div className="pointer-events-none absolute right-2 top-2">
            <Badge tone={BADGE_TONE.top}>{RANKING_LABELS.topBadge}</Badge>
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold leading-snug text-ink">
        {item.name}
      </h3>

      <DietaryTags item={item} />

      {/* Popularity, kept separate from the vote-based ranking so neither
          signal hides behind the other. */}
      {orderShare !== null && orderShare > 0 && (
        <p className="text-xs font-medium text-brand">
          {ORDER_LABELS.share(orderShare)}
        </p>
      )}

      {/* Price and the vote on one line, always present in that shape, so every
          card in a grid has the same footprint whatever data it has. The
          recommend share used to sit above this as its own sentence; it now
          rides on the thumb, which is both where the eye lands and the control
          that produces it. */}
      <div className="mt-auto flex items-center justify-between gap-2">
        <span
          className={clsx(
            "text-sm tabular-nums",
            price !== null ? "text-ink" : "text-ink-muted",
          )}
        >
          {price !== null
            ? convertCurrency(price)
            : DISH_LABELS.priceUnavailable}
        </span>

        <VoteButton
          compact
          value={vote}
          upCount={score?.voteCount}
          metric={metric}
          disabled={!canVote}
          onVote={onVote ? handleVote : undefined}
        />
      </div>
    </article>
  );
};

export default DishCard;
