import { FC } from "react";
import clsx from "clsx";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import { VoteButtonInterface } from "@/interfaces/ranking";
import { VOTE } from "@/customConstants/ranking";
import { DISH_LABELS } from "@/customConstants/labels";
import { VoteValue } from "@/types";

const BASE_CLASSES =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:opacity-40 motion-reduce:transition-none";

/**
 * One tap, two options. Deliberately not a star rating: fine-grained scores
 * from few voters are the noisiest possible input, and the extra precision
 * costs enough friction that most people never vote at all.
 */
const VoteButton: FC<VoteButtonInterface> = ({
  value,
  upCount,
  disabled,
  onVote,
}) => {
  const handleVote = (next: VoteValue) => () => onVote && onVote(next);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={DISH_LABELS.voteUp}
        aria-pressed={value === VOTE.up}
        title={disabled ? DISH_LABELS.signInToVote : DISH_LABELS.voteUp}
        disabled={disabled}
        onClick={handleVote(VOTE.up)}
        className={clsx(
          BASE_CLASSES,
          value === VOTE.up
            ? "border-brand bg-brand text-white"
            : "border-line text-ink-muted hover:border-brand hover:text-brand",
        )}
      >
        <ThumbUpAltOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <button
        type="button"
        aria-label={DISH_LABELS.voteDown}
        aria-pressed={value === VOTE.down}
        title={disabled ? DISH_LABELS.signInToVote : DISH_LABELS.voteDown}
        disabled={disabled}
        onClick={handleVote(VOTE.down)}
        className={clsx(
          BASE_CLASSES,
          value === VOTE.down
            ? "border-ink bg-ink text-white"
            : "border-line text-ink-muted hover:border-neutral-800",
        )}
      >
        <ThumbDownAltOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      {!!upCount && (
        <span className="text-xs tabular-nums text-ink-muted">
          {upCount}
        </span>
      )}
    </div>
  );
};

export default VoteButton;
