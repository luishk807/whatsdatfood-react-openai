import { FC } from "react";
import clsx from "clsx";
import { ThumbUpIcon, ThumbDownIcon } from "@/components/icons";
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
 *
 * On a card only the recommend half is shown. Two circles on every tile
 * scattered dozens of tiny controls across a menu, and competed with the
 * photographs for attention - the down vote lives in the detail sheet, where
 * somebody has already stopped to look at one dish.
 */
const VoteButton: FC<VoteButtonInterface> = ({
  value,
  upCount,
  disabled,
  compact,
  metric,
  onVote,
}) => {
  const handleVote = (next: VoteValue) => () => onVote && onVote(next);
  const recommended = value === VOTE.up;

  if (compact) {
    return (
      <button
        type="button"
        aria-label={DISH_LABELS.recommend}
        aria-pressed={recommended}
        title={disabled ? DISH_LABELS.signInToVote : DISH_LABELS.recommend}
        disabled={disabled}
        onClick={handleVote(VOTE.up)}
        className={clsx(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 transition-colors disabled:opacity-40 motion-reduce:transition-none",
          // A dish with a real number carries it in brand weight, because that
          // number is the answer to "what should I order". A dish with nothing
          // to show stays quiet rather than printing a zero.
          metric ? "text-sm font-semibold" : "text-xs",
          recommended
            ? "border-brand bg-brand-soft text-brand"
            : metric
              ? "border-line text-brand hover:border-brand"
              : "border-line text-ink-muted hover:border-brand hover:text-brand",
        )}
      >
        <ThumbUpIcon size={metric ? 15 : 14} />
        {metric ? (
          <span className="tabular-nums">{metric}</span>
        ) : (
          !!upCount && <span className="tabular-nums text-xs">{upCount}</span>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={DISH_LABELS.voteUp}
        aria-pressed={recommended}
        title={disabled ? DISH_LABELS.signInToVote : DISH_LABELS.voteUp}
        disabled={disabled}
        onClick={handleVote(VOTE.up)}
        className={clsx(
          BASE_CLASSES,
          recommended
            ? "border-brand bg-brand text-white"
            : "border-line text-ink-muted hover:border-brand hover:text-brand",
        )}
      >
        <ThumbUpIcon size={17} />
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
        <ThumbDownIcon size={17} />
      </button>

      {!!upCount && (
        <span className="text-xs tabular-nums text-ink-muted">{upCount}</span>
      )}
    </div>
  );
};

export default VoteButton;
