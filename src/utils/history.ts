import dayjs from "dayjs";
import { UserView } from "@/interfaces/users";

/**
 * What "recently viewed" should actually show.
 *
 * A view is recorded every time somebody opens a restaurant page, which is
 * the right thing to store and the wrong thing to print. Somebody comparing
 * three places flips between them repeatedly, so a raw list is the same four
 * restaurants over and over and the one they looked at yesterday is pushed
 * off the bottom by their own indecision.
 */

/** A view carrying a restaurant we can actually link to. */
const usable = (view: UserView): boolean =>
  Boolean(view?.restaurant?.name && view?.restaurant?.slug);

const when = (view: UserView): number => {
  const stamp = dayjs(view?.createdAt);

  // An unparseable date sorts oldest rather than throwing the list out. The
  // restaurant is still a real thing somebody looked at.
  return stamp.isValid() ? stamp.valueOf() : 0;
};

/**
 * One row per restaurant, at the most recent time it was opened.
 *
 * Keeps the *latest* view rather than the first, because the question this
 * page answers is "what was I just looking at" - and it preserves the order
 * the server sent where two views tie, so the list never reshuffles between
 * renders.
 */
export const recentlyViewed = (views: UserView[] = []): UserView[] => {
  const newest = new Map<string, UserView>();

  for (const view of views.filter(usable)) {
    const slug = view.restaurant.slug as string;
    const held = newest.get(slug);

    if (!held || when(view) > when(held)) {
      newest.set(slug, view);
    }
  }

  return [...newest.values()].sort((a, b) => when(b) - when(a));
};

export type HistoryGroup = { label: string; views: UserView[] };

/**
 * Grouped by when, because that is the only thing a date is useful for here.
 *
 * The page used to print a formatted timestamp beside every row, which is
 * precise and unreadable: nobody wants to know they opened a restaurant at
 * 14:32 on a Tuesday, they want to know whether it was today. Days are the
 * unit somebody actually thinks in.
 *
 * `relativeDay` supplies the wording so "today" and "yesterday" are spelled
 * the same here as everywhere else in the product.
 */
export const groupByDay = (
  views: UserView[] = [],
  label: (value?: string | null) => string | null,
): HistoryGroup[] => {
  const groups: HistoryGroup[] = [];

  for (const view of views) {
    const heading = label(view?.createdAt as unknown as string) ?? "";
    const last = groups[groups.length - 1];

    // Consecutive rather than keyed, because the list is already in date
    // order - so a group can only ever be the current one or a new one, and
    // a map would need re-sorting afterwards to say the same thing.
    if (last && last.label === heading) {
      last.views.push(view);
    } else {
      groups.push({ label: heading, views: [view] });
    }
  }

  return groups;
};
