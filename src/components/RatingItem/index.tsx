import { type FC } from "react";
import { RatingItemInt } from "@/interfaces/users";
import RatingCustom from "@/components/Rating";
import { _get } from "@/utils";
import { getDate } from "@/utils/time";

/**
 * One review.
 *
 * Left-aligned: the body used to be centred, which is the hardest way to read
 * a paragraph - the eye loses the start of each line.
 */
const RatingItem: FC<RatingItemInt> = ({ data }) => {
  const user = _get<Record<string, unknown> | null>(data, "user", null);
  const fullName = user
    ? `${_get(user, "first_name", "")} ${_get(user, "last_name", "")}`.trim()
    : null;

  const { rating: score, title, comment, updatedAt } = data;

  return (
    <article className="flex flex-col gap-1 text-left">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{fullName}</span>
        <time className="shrink-0 text-xs text-ink-muted">
          {getDate(updatedAt)}
        </time>
      </div>

      <div className="flex items-center gap-2">
        <RatingCustom defaultValue={score} isDisplay={true} />
        {title && <span className="text-sm text-ink">{title}</span>}
      </div>

      {comment && (
        <p className="text-sm leading-relaxed text-ink-muted">{comment}</p>
      )}
    </article>
  );
};

export default RatingItem;
