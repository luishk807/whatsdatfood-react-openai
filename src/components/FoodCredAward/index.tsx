import { useEffect, type FC } from "react";
import FoodCredAmount from "@/components/FoodCredAmount";
import {
  AWARD_VISIBLE_MS,
  FOOD_CRED_EVENT,
  FOOD_CRED_LABELS,
} from "@/customConstants/reputation";
import { FoodCredAwardInterface } from "@/interfaces/reputation";

/**
 * What you just earned, the moment you earned it.
 *
 * The upload response carries the award, so this needs no second request and
 * appears while the contributor is still looking at the dish they photographed
 * — which is the only moment the number means anything to them.
 *
 * Breaks the total down when there is more than one line. "+30 Food Cred" on
 * its own invites the question; "+10 Photo, +20 First photo of this dish"
 * answers it and teaches the rules without a help page.
 */
const FoodCredAward: FC<FoodCredAwardInterface> = ({ award, onDismiss }) => {
  useEffect(() => {
    if (!award) {
      return;
    }

    const timer = window.setTimeout(onDismiss, AWARD_VISIBLE_MS);

    return () => window.clearTimeout(timer);
  }, [award, onDismiss]);

  if (!award || !award.events.length) {
    return null;
  }

  const discovered = award.events.some(
    (event) =>
      event.type === FOOD_CRED_EVENT.firstDishPhoto ||
      event.type === FOOD_CRED_EVENT.firstRestaurantPhoto,
  );

  return (
    // Above the thumb, not under it: the upload control is in the lower third
    // and a panel landing on top of it hides what was just tapped.
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-3 z-[60] mx-auto w-[min(92vw,26rem)] px-1"
    >
      <div className="rounded-card border border-brand/30 bg-surface-raised p-3 shadow-sheet">
        <div className="flex items-center justify-between gap-3">
          <FoodCredAmount amount={award.earned} signed size="lg" />
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-full px-2 py-1 text-xs text-ink-muted hover:text-ink"
          >
            {FOOD_CRED_LABELS.dismiss}
          </button>
        </div>

        <p className="mt-0.5 text-sm font-medium text-ink">
          {discovered
            ? FOOD_CRED_LABELS.firstDiscovery
            : FOOD_CRED_LABELS.photoApproved}
        </p>

        {award.events.length > 1 && (
          <ul className="mt-2 flex flex-col gap-0.5">
            {award.events.map((event) => (
              <li
                key={event.type}
                className="flex items-center justify-between gap-3 text-xs text-ink-muted"
              >
                <span>{event.label}</span>
                <span className="tabular-nums text-brand">+{event.points}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FoodCredAward;
