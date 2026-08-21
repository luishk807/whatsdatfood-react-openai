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

const at = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();

describe("one row per restaurant", () => {
  it("collapses repeat visits to a single entry", () => {
    const list = recentlyViewed([
      view(1, "kame", at(1)),
      view(2, "kame", at(3)),
      view(3, "kame", at(5)),
    ]);

    expect(list).toHaveLength(1);
  });

  it("keeps the most recent visit, not the first", () => {
    // The question is "what was I just looking at".
    const list = recentlyViewed([
      view(1, "kame", at(5)),
      view(2, "kame", at(1)),
    ]);

    expect(list[0].id).toBe(2);
  });

  it("puts the most recently opened restaurant first", () => {
    const list = recentlyViewed([
      view(1, "older", at(10)),
      view(2, "newer", at(1)),
    ]);

    expect(list.map((one) => one.restaurant.slug)).toEqual(["newer", "older"]);
  });

  it("drops a view whose restaurant we cannot link to", () => {
    // A row with no slug renders a card that goes nowhere.
    const broken = { id: 9, restaurant: { name: "No slug" } } as unknown as UserView;

    expect(recentlyViewed([broken, view(1, "kame", at(1))])).toHaveLength(1);
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
      recentlyViewed([view(1, "a", at(1)), view(2, "b", at(2))]),
      relativeDay,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("today");
    expect(groups[0].views).toHaveLength(2);
  });

  it("separates yesterday from today", () => {
    const groups = groupByDay(
      recentlyViewed([view(1, "a", at(1)), view(2, "b", at(30))]),
      relativeDay,
    );

    expect(groups.map((one) => one.label)).toEqual(["today", "yesterday"]);
  });

  it("keeps the groups in the order the list was already in", () => {
    // The list is sorted newest first, so a group can only be the current one
    // or a new one - which is why this walks rather than keying a map.
    const groups = groupByDay(
      recentlyViewed([
        view(1, "a", at(1)),
        view(2, "b", at(30)),
        view(3, "c", at(2)),
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
