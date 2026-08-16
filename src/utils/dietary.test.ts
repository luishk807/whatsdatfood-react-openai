import {
  getDietaryTags,
  getSpiceLabel,
  isConfirmedByRestaurant,
  hasDietaryInfo,
} from "@/utils/dietary";
import { DIETARY_LABELS } from "@/customConstants/labels";
import { MenuItemType } from "@/interfaces/restaurants";

const dish = (extra: Partial<MenuItemType> = {}): MenuItemType => ({
  id: 1,
  name: "Curry",
  description: "",
  category: "Mains",
  top_choice: false,
  ...extra,
});

describe("getDietaryTags", () => {
  it("says nothing when nobody has said anything", () => {
    expect(getDietaryTags(dish())).toEqual([]);
  });

  it("treats a false allergen as no information, not as safety", () => {
    // The dangerous case. `false` from a language model is a guess, and a
    // person with an allergy must never see it rendered as reassurance.
    const tags = getDietaryTags(
      dish({ contains_nuts: false, contains_shellfish: false }),
    );

    expect(tags).toEqual([]);
  });

  it("never produces an absence claim", () => {
    const labels = getDietaryTags(
      dish({
        contains_nuts: false,
        contains_dairy: false,
        is_vegetarian: true,
      }),
    ).map((tag) => tag.label);

    expect(labels.join(" ").toLowerCase()).not.toContain("free of");
    expect(labels.join(" ").toLowerCase()).not.toContain("no nuts");
    expect(labels).toEqual([DIETARY_LABELS.vegetarian]);
  });

  it("warns when an allergen is actually present", () => {
    const tags = getDietaryTags(dish({ contains_nuts: true }));

    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({
      label: DIETARY_LABELS.containsNuts,
      tone: "warning",
    });
  });

  it("shows vegan instead of vegetarian rather than both", () => {
    const tags = getDietaryTags(dish({ is_vegan: true, is_vegetarian: true }));

    expect(tags.map((t) => t.label)).toEqual([DIETARY_LABELS.vegan]);
  });

  it("shows vegetarian when it is not vegan", () => {
    const tags = getDietaryTags(dish({ is_vegetarian: true }));

    expect(tags.map((t) => t.label)).toEqual([DIETARY_LABELS.vegetarian]);
  });

  it("combines what is known", () => {
    const tags = getDietaryTags(
      dish({ is_vegetarian: true, contains_dairy: true, contains_nuts: true }),
    );

    expect(tags.map((t) => t.key)).toEqual(["vegetarian", "nuts", "dairy"]);
  });
});

describe("getSpiceLabel", () => {
  it("is silent when unknown", () => {
    expect(getSpiceLabel(dish())).toBeNull();
    expect(getSpiceLabel(dish({ spice_level: null }))).toBeNull();
  });

  it("is silent for a dish that is not spicy", () => {
    expect(getSpiceLabel(dish({ spice_level: 0 }))).toBeNull();
  });

  it.each([
    [1, DIETARY_LABELS.spice[1]],
    [2, DIETARY_LABELS.spice[2]],
    [3, DIETARY_LABELS.spice[3]],
  ])("labels level %s as %s", (level, expected) => {
    expect(getSpiceLabel(dish({ spice_level: level }))).toBe(expected);
  });

  it("ignores a level outside the scale", () => {
    expect(getSpiceLabel(dish({ spice_level: 99 }))).toBeNull();
  });
});

describe("isConfirmedByRestaurant", () => {
  it("distinguishes the kitchen from a guess", () => {
    expect(isConfirmedByRestaurant(dish({ dietary_source: "owner" }))).toBe(true);
    expect(isConfirmedByRestaurant(dish({ dietary_source: "ai" }))).toBe(false);
    expect(isConfirmedByRestaurant(dish())).toBe(false);
  });
});

describe("hasDietaryInfo", () => {
  it("is false when there is nothing to show", () => {
    expect(hasDietaryInfo(dish())).toBe(false);
    expect(hasDietaryInfo(dish({ contains_nuts: false }))).toBe(false);
  });

  it("is true once anything is known", () => {
    expect(hasDietaryInfo(dish({ is_vegan: true }))).toBe(true);
    expect(hasDietaryInfo(dish({ spice_level: 2 }))).toBe(true);
  });
});
