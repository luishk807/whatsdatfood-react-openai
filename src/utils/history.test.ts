import { groupByDay, recentlyViewed } from "@/utils/history";
import { relativeDay } from "@/utils/time";
import { UserView } from "@/interfaces/users";

/**
 * A view is recorded every time a restaurant page opens, which is right to
 * store and wrong to print. Somebody comparing three places flips between
 * them repeatedly, so the raw list is the same few restaurants over and over
 * and yesterday's is pushed off the bottom by their own indecision.
 */
const view = (id: number, slug: string, iso: string): UserView =>
  ({
    id,
    restaurant_id: id,
    user_id: 1,
    createdAt: iso,
    restaurant: { id, name: slug, slug },
  }) as unknown as UserView;

/**
 * A timestamp at midday, N days ago.
 *
 * These used to say "one hour ago" and "thirty hours ago", which is only
 * "today" and "yesterday" if the suite happens to run in the middle of the
 * day. CI ran it near midnight and one hour ago was yesterday - a test that
 * passes depending on what time it is is worse than no test, because it
 * fails on an unrelated commit and teaches everyone to re-run the job.
 *
 * Midday is far enough from both boundaries that no timezone the runner
 * might use can push it into an adjacent day. The hour varies only to order
 * entries within the same day.
 */
const onDay = (daysAgo: number, hour = 12) => {
  const when = new Date();
  when.setDate(when.getDate() - daysAgo);
  when.setHours(hour, 0, 0, 0);
  return when.toISOString();
};

describe("one row per restaurant", () => {
  it("collapses repeat visits to a single entry", () => {
    const list = recentlyViewed([
      view(1, "kame", onDay(0, 14)),
      view(2, "kame", onDay(0, 12)),
      view(3, "kame", onDay(0, 10)),
    ]);

    expect(list).toHaveLength(1);
  });

  it("keeps the most recent visit, not the first", () => {
    // The question is "what was I just looking at".
    const list = recentlyViewed([
      view(1, "kame", onDay(0, 10)),
      view(2, "kame", onDay(0, 14)),
    ]);

    expect(list[0].id).toBe(2);
  });

  it("puts the most recently opened restaurant first", () => {
    const list = recentlyViewed([
      view(1, "older", onDay(2)),
      view(2, "newer", onDay(0)),
    ]);

    expect(list.map((one) => one.restaurant.slug)).toEqual(["newer", "older"]);
  });

  it("drops a view whose restaurant we cannot link to", () => {
    // A row with no slug renders a card that goes nowhere.
    const broken = { id: 9, restaurant: { name: "No slug" } } as unknown as UserView;

    expect(recentlyViewed([broken, view(1, "kame", onDay(0, 14))])).toHaveLength(1);
  });

  it("survives an unparseable date rather than dropping the restaurant", () => {
    const odd = view(1, "kame", "not-a-date");

    expect(recentlyViewed([odd])).toHaveLength(1);
  });

  it("copes with nothing at all", () => {
    expect(recentlyViewed()).toEqual([]);
    expect(recentlyViewed([])).toEqual([]);
  });
});

describe("grouping by day", () => {
  it("puts today's visits under one heading", () => {
    const groups = groupByDay(
      recentlyViewed([view(1, "a", onDay(0, 14)), view(2, "b", onDay(0, 12))]),
      relativeDay,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("today");
    expect(groups[0].views).toHaveLength(2);
  });

  it("separates yesterday from today", () => {
    const groups = groupByDay(
      recentlyViewed([view(1, "a", onDay(0, 14)), view(2, "b", onDay(1))]),
      relativeDay,
    );

    expect(groups.map((one) => one.label)).toEqual(["today", "yesterday"]);
  });

  it("keeps the groups in the order the list was already in", () => {
    // The list is sorted newest first, so a group can only be the current one
    // or a new one - which is why this walks rather than keying a map.
    const groups = groupByDay(
      recentlyViewed([
        view(1, "a", onDay(0, 14)),
        view(2, "b", onDay(1)),
        view(3, "c", onDay(0, 12)),
      ]),
      relativeDay,
    );

    expect(groups[0].label).toBe("today");
    expect(groups[0].views).toHaveLength(2);
    expect(groups[1].label).toBe("yesterday");
  });

  it("copes with an empty list", () => {
    expect(groupByDay([], relativeDay)).toEqual([]);
  });
});
