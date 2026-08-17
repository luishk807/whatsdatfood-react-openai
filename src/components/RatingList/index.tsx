import { type FC, useCallback, useEffect, useState } from "react";
import useUserRating from "@/customHooks/useUserRating";
import { _get } from "@/utils";
import { UserRating, RatingListComponentInterface } from "@/interfaces/users";
import UserRatingItem from "@/components/RatingItem";
import { LIMIT_DEFAULT, PAGE_DEFAULT } from "@/customConstants";
import { REVIEW_LABELS } from "@/customConstants/labels";

/**
 * Reviews for one dish.
 *
 * The dish's name used to be repeated above this list, inside a sheet whose
 * title is already that name - so someone scrolling past a full-width photo
 * met the same words a third time. The heading says what the section is.
 */
const RatingListComponent: FC<RatingListComponentInterface> = ({
  data,
  onOpenCreate,
}) => {
  const [ratingLists, setRatingLists] = useState<UserRating[]>([]);
  const { getUserRatingsByItemId } = useUserRating();

  // Held in a ref-free callback keyed on the dish: the hook returns a new
  // function identity every render, and depending on it re-runs the effect
  // forever.
  const itemId = Number(_get(data, "id", 0));

  const load = useCallback(async () => {
    if (!itemId) {
      setRatingLists([]);
      return;
    }

    const resp = await getUserRatingsByItemId(
      itemId,
      PAGE_DEFAULT,
      LIMIT_DEFAULT,
    );

    setRatingLists((resp?.data as UserRating[]) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">
          {REVIEW_LABELS.heading}
          {ratingLists.length > 0 && (
            <span className="ml-2 text-xs font-normal tabular-nums text-ink-muted">
              {REVIEW_LABELS.count(ratingLists.length)}
            </span>
          )}
        </h3>

        <button
          type="button"
          onClick={onOpenCreate}
          className="shrink-0 text-sm text-brand underline underline-offset-2"
        >
          {REVIEW_LABELS.write}
        </button>
      </div>

      {ratingLists.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {ratingLists.map((rating, index) => (
            <li key={_get(rating, "id", index)} className="py-3">
              <UserRatingItem data={rating} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">{REVIEW_LABELS.none}</p>
      )}
    </section>
  );
};

export default RatingListComponent;
