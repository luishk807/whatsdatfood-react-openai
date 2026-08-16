import { shareOfDiners, getMostOrdered } from "@/utils/orders";
import { ORDERS } from "@/customConstants/ranking";
import { MenuItemType } from "@/interfaces/restaurants";

const dish = (name: string, orderCount?: number): MenuItemType => ({
  id: Math.abs(name.length * 7),
  name,
  description: "",
  category: "Mains",
  top_choice: false,
  order_count: orderCount,
});

describe("shareOfDiners", () => {
  it("is withheld until enough people have answered", () => {
    // "100% order this" from one diner is a lie told with arithmetic.
    expect(shareOfDiners(1, 1)).toBeNull();
    expect(shareOfDiners(3, ORDERS.MIN_DINERS_FOR_SHARE - 1)).toBeNull();
  });

  it("is reported once there are enough", () => {
    expect(shareOfDiners(3, ORDERS.MIN_DINERS_FOR_SHARE)).toBe(
      Math.round((3 / ORDERS.MIN_DINERS_FOR_SHARE) * 100),
    );
  });

  it("produces the headline number", () => {
    expect(shareOfDiners(73, 100)).toBe(73);
  });

  it("rounds rather than printing decimals", () => {
    expect(shareOfDiners(2, 6)).toBe(33);
  });

  it("treats nobody ordering it as zero, not missing", () => {
    expect(shareOfDiners(0, 10)).toBe(0);
  });

  it("handles missing numbers without producing NaN", () => {
    expect(shareOfDiners(undefined, undefined)).toBeNull();
    expect(shareOfDiners(undefined, 10)).toBe(0);
  });
});

describe("getMostOrdered", () => {
  it("ranks by how many people ordered it", () => {
    const items = [dish("A", 2), dish("B", 9), dish("C", 5)];

    expect(getMostOrdered(items).map((i) => i.name)).toEqual(["B", "C", "A"]);
  });

  it("ignores dishes nobody has ordered", () => {
    const items = [dish("A", 0), dish("B"), dish("C", 3)];

    expect(getMostOrdered(items).map((i) => i.name)).toEqual(["C"]);
  });

  it("returns nothing when no orders are recorded", () => {
    expect(getMostOrdered([dish("A"), dish("B", 0)])).toEqual([]);
  });

  it("respects the requested size", () => {
    const items = [dish("A", 3), dish("B", 2), dish("C", 1)];

    expect(getMostOrdered(items, 2)).toHaveLength(2);
  });
});
