import { type FC } from "react";
import clsx from "clsx";
import {
  RECOGNITION_HOUSE_SOURCE,
  RECOGNITION_KIND,
} from "@/customConstants/recognition";
import { RecognitionBadgesInterface } from "@/interfaces/recognition";
import { rankRecognitions, recognitionLabel } from "@/utils/recognition";

/**
 * Why this restaurant, out of the thirty within a mile.
 *
 * **Two families, drawn so they can never be confused.** An outlined mark in
 * ink is somebody else's judgement — a guide with a name worth citing. A
 * filled `brand-soft` chip is ours, earned from what this community has
 * actually done. A badge that lets our ranking borrow a guide's authority is
 * a lie about who is recommending the place, and it is the kind a product
 * only gets to tell once.
 *
 * That is also why our own marks say whose they are on anything bigger than a
 * card. "Must Visit" alone, beside a Michelin star, reads as a second award;
 * "What's Dat Food Must Visit" cannot.
 *
 * **Never `brand` itself.** Brand is the vote's colour and the vote is the
 * product — a recommendation badge in it trades one signal for another. The
 * soft tint is related and quieter, which is the correct relationship.
 *
 * **No logos and no emoji.** Michelin's mark is theirs and we have not
 * established that we may use it, so stars are typographic. An emoji is a
 * different picture on every platform, carries no theme colour, and cannot be
 * swapped without editing every call site — the reason `FoodCredIcon` exists.
 *
 * Renders nothing at all when there is nothing to say, which is most
 * restaurants. An empty row of chrome under every name is how a card gets
 * taller for no information.
 */
const RecognitionBadges: FC<RecognitionBadgesInterface> = ({
  recognitions,
  limit,
  compact,
}) => {
  const shown = rankRecognitions(recognitions, limit);

  if (!shown.length) {
    return null;
  }

  return (
    <span className="flex flex-wrap items-center gap-1">
      {shown.map((one) => {
        const official = one.kind === RECOGNITION_KIND.official;
        const label = recognitionLabel(one.award);

        return (
          <span
            key={`${one.source}:${one.award}`}
            /* Said in full for a screen reader, which gets no help from the
               difference between an outline and a tint. Whose judgement this
               is belongs in the announcement, not only in the styling. */
            aria-label={
              official ? label : `${RECOGNITION_HOUSE_SOURCE} ${label}`
            }
            className={clsx(
              "inline-flex shrink-0 items-center rounded-pill border font-semibold",
              compact ? "px-1.5 py-0 text-[11px]" : "px-2 py-0.5 text-xs",
              official
                ? "border-ink text-ink"
                : "border-transparent bg-brand-soft text-brand-strong",
            )}
          >
            {label}
          </span>
        );
      })}
    </span>
  );
};

export default RecognitionBadges;
