import { type FC } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import FoodCredAmount from "@/components/FoodCredAmount";
import { FOOD_CRED_LABELS } from "@/customConstants/reputation";
import { buildMenuResultsPath } from "@/customConstants/routes";
import { FoodCredHistoryInterface } from "@/interfaces/reputation";
import { getDate } from "@/utils/time";

/**
 * The ledger, as a contributor reads it.
 *
 * Every row says what it was for and what it was worth, including the ones
 * that were taken back — a total that drops without an explanation is the
 * fastest way to lose the person who was contributing. A reversed row stays
 * visible, struck through, with the reason still on it.
 */
const FoodCredHistory: FC<FoodCredHistoryInterface> = ({ events, loading }) => {
  if (loading) {
    return (
      <ul className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2].map((row) => (
          <li
            key={row}
            className="h-16 animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none"
          />
        ))}
      </ul>
    );
  }

  if (!events.length) {
    return (
      <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
        {FOOD_CRED_LABELS.historyEmpty}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {events.map((event) => {
        const where = [event.dish_name, event.restaurant_name]
          .filter(Boolean)
          .join(" · ");

        return (
          <li
            key={event.id}
            className="flex items-center gap-3 rounded-card border border-line bg-surface-raised p-3"
          >
            {/* The photo is the contribution, so it leads the row wherever
                there is one. */}
            {event.photo_url ? (
              <img
                src={event.photo_url}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className={clsx(
                  "h-12 w-12 shrink-0 rounded-card object-cover",
                  event.reversed && "opacity-40 grayscale",
                )}
              />
            ) : (
              <span className="h-12 w-12 shrink-0 rounded-card bg-surface-sunken" />
            )}

            <div className="min-w-0 flex-1">
              <p
                className={clsx(
                  "truncate text-sm",
                  event.reversed ? "text-ink-muted" : "text-ink",
                )}
              >
                {event.label ?? event.event_type}
              </p>
              {where && (
                <p className="truncate text-xs text-ink-muted">
                  {event.restaurant_slug ? (
                    <Link
                      to={buildMenuResultsPath(event.restaurant_slug)}
                      className="hover:text-ink"
                    >
                      {where}
                    </Link>
                  ) : (
                    where
                  )}
                </p>
              )}
              {event.createdAt && (
                <p className="text-xs text-ink-muted">
                  {getDate(event.createdAt)}
                </p>
              )}
            </div>

            <FoodCredAmount
              amount={event.points}
              signed
              size="sm"
              muted={event.reversed}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default FoodCredHistory;
