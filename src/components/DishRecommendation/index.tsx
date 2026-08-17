import { FC } from "react";
import VoteButton from "@/components/VoteButton";
import { MenuItemType } from "@/interfaces/restaurants";
import { VoteValue } from "@/types";
import { RECOMMEND_LABELS, DISH_LABELS } from "@/customConstants/labels";
import { recommendShare, getVoteCount } from "@/utils/ranking";

export interface DishRecommendationInterface {
  item: MenuItemType;
  vote?: VoteValue | null;
  canVote?: boolean;
  onVote?: (value: VoteValue) => void;
}

/**
 * The headline answer: would people order this again.
 *
 * Thumbs and five-star reviews were competing to answer the same question in
 * three places. A percentage is the more useful answer and the one this app
 * can actually collect from someone at a table - stars stay inside written
 * reviews, where a person is already writing prose.
 *
 * Below the vote threshold it shows the count instead. One vote is not a
 * proportion, and "100% recommend" from a single person is a lie with a
 * number attached.
 */
const DishRecommendation: FC<DishRecommendationInterface> = ({
  item,
  vote,
  canVote,
  onVote,
}) => {
  const share = recommendShare(item);
  const votes = getVoteCount(item);

  return (
    <div className="flex flex-col gap-3">
      {share !== null ? (
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tabular-nums text-brand">
            {RECOMMEND_LABELS.share(share)}
          </span>
          <span className="text-xs tabular-nums text-ink-muted">
            {RECOMMEND_LABELS.votes(votes)}
          </span>
        </div>
      ) : (
        <span className="text-sm text-ink-muted">
          {RECOMMEND_LABELS.tooFew(votes)}
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm text-ink-muted">
          {canVote ? RECOMMEND_LABELS.ask : DISH_LABELS.signInToVote}
        </span>
        <VoteButton
          value={vote}
          disabled={!canVote}
          onVote={onVote}
        />
      </div>
    </div>
  );
};

export default DishRecommendation;
