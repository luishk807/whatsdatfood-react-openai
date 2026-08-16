import {
  getDishPhoto,
  getDishPhotoUrl,
  getDishPhotoSource,
  normalizeCategory,
  groupDishesByCategory,
} from "@/utils/dish";
import { IMAGE_SOURCE } from "@/customConstants/images";
import { MenuItemType, MenuItemPhoto } from "@/interfaces/restaurants";

const photo = (url?: string): MenuItemPhoto =>
  ({ url_m: url }) as MenuItemPhoto;

const dish = (
  name: string,
  category: string,
  extra: Partial<MenuItemType> = {},
): MenuItemType => ({
  id: 1,
  name,
  description: "",
  category,
  top_choice: false,
  ...extra,
});

describe("getDishPhoto", () => {
  it("prefers the first photo that actually has a url", () => {
    const item = dish("Steak", "Mains", {
      images: [photo(undefined), photo("https://example.test/a.jpg")],
    });

    expect(getDishPhoto(item)?.url_m).toBe("https://example.test/a.jpg");
  });

  it("returns undefined when the dish has no photos at all", () => {
    expect(getDishPhoto(dish("Steak", "Mains"))).toBeUndefined();
  });
});

describe("getDishPhotoUrl", () => {
  it("reads the nested photo returned with the menu", () => {
    const item = dish("Steak", "Mains", {
      images: [photo("https://example.test/a.jpg")],
    });

    expect(getDishPhotoUrl(item)).toBe("https://example.test/a.jpg");
  });

  it("falls back to a url resolved later in the session", () => {
    const item = dish("Steak", "Mains", { image: "https://example.test/b.jpg" });
    expect(getDishPhotoUrl(item)).toBe("https://example.test/b.jpg");
  });

  it("is null when there is nothing to show", () => {
    expect(getDishPhotoUrl(dish("Steak", "Mains"))).toBeNull();
  });
});

describe("getDishPhotoSource", () => {
  it("labels an existing photo as stock, since none are user uploads yet", () => {
    const item = dish("Steak", "Mains", {
      images: [photo("https://example.test/a.jpg")],
    });

    expect(getDishPhotoSource(item)).toBe(IMAGE_SOURCE.stock);
  });

  it("has no source when there is no photo", () => {
    expect(getDishPhotoSource(dish("Steak", "Mains"))).toBeUndefined();
  });
});

describe("normalizeCategory", () => {
  it.each([
    ["Appetizers", "Appetizers"],
    ["appetizers", "Appetizers"],
    ["  APPETIZERS  ", "Appetizers"],
  ])("normalises %s to %s", (input, expected) => {
    expect(normalizeCategory(input)).toBe(expected);
  });

  it("handles a missing category without throwing", () => {
    expect(normalizeCategory(undefined)).toBe("");
  });
});

describe("groupDishesByCategory", () => {
  it("collapses casing variants into one section", () => {
    // The AI returns both spellings for the same menu, which used to render as
    // two separate category headings.
    const grouped = groupDishesByCategory([
      dish("Spring roll", "Appetizers"),
      dish("Dumpling", "appetizer "),
      dish("Wings", "APPETIZERS"),
    ]);

    expect(Object.keys(grouped).sort()).toEqual(["Appetizer", "Appetizers"]);
    expect(grouped["Appetizers"]).toHaveLength(2);
  });

  it("preserves the order dishes arrive in", () => {
    const grouped = groupDishesByCategory([
      dish("First", "Mains"),
      dish("Second", "Mains"),
    ]);

    expect(grouped["Mains"].map((item) => item.name)).toEqual([
      "First",
      "Second",
    ]);
  });
});
