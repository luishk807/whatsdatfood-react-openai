import { MenuItemType, MenuItemPhoto } from "@/interfaces/restaurants";
import { IMAGE_SOURCE } from "@/customConstants/images";
import { ImageSourceType } from "@/types";

/**
 * The photo that represents the dish.
 *
 * A diner's photo beats a stock one, always. The whole premise is that the
 * people at the table took these, so once one exists it is the answer to "what
 * does this look like" — a search result is the placeholder it replaces. This
 * used to take whichever photo came first, which meant the stock photo kept the
 * hero slot because it was stored earlier.
 */
export const getDishPhoto = (item: MenuItemType): MenuItemPhoto | undefined => {
  const usable = item.images?.filter((photo) => !!photo?.url_m) ?? [];

  return (
    usable.find((photo) => photo.source === IMAGE_SOURCE.community) ??
    usable[0] ??
    item.images?.[0]
  );
};

export const getDishPhotoUrl = (item: MenuItemType): string | null =>
  getDishPhoto(item)?.url_m ?? item.image ?? null;

/** What the server says the photo is; stock is the fallback for older rows. */
export const getDishPhotoSource = (
  item: MenuItemType,
): ImageSourceType | undefined => {
  if (!getDishPhotoUrl(item)) {
    return undefined;
  }

  return getDishPhoto(item)?.source === IMAGE_SOURCE.community
    ? IMAGE_SOURCE.community
    : IMAGE_SOURCE.stock;
};

/** Uploader to credit, when the photo came from the community. */
export const getDishPhotoCredit = (item: MenuItemType): string | null => {
  const photo = getDishPhoto(item);

  if (!photo || photo.source !== IMAGE_SOURCE.community) {
    return null;
  }

  return photo.owner ?? null;
};

/**
 * Categories come back from the AI with inconsistent casing ("Appetizers" and
 * "appetizer"), which rendered as two separate sections.
 */
export const normalizeCategory = (category?: string): string => {
  if (!category) {
    return "";
  }

  const trimmed = category.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const groupDishesByCategory = (
  items: MenuItemType[],
): Record<string, MenuItemType[]> =>
  items.reduce<Record<string, MenuItemType[]>>((acc, item) => {
    if (!item) {
      return acc;
    }

    const category = normalizeCategory(item.category);
    acc[category] = acc[category] ? [...acc[category], item] : [item];
    return acc;
  }, {});

/**
 * A dish's price, or null when the menu did not give one.
 *
 * Menus arrive from an AI extraction that leaves price null or zero often
 * enough that this is a normal case. Running that through a currency formatter
 * printed `$0.00` on most of the menu, which does not read as missing data — it
 * reads as a claim that the dish is free.
 *
 * Zero is treated as absent rather than free. A genuinely free item is rare
 * enough, and mislabelling one as unpriced is a far smaller error than telling
 * someone a $180 omakase costs nothing.
 */
export const dishPrice = (
  // Narrowed to the one field it reads. It used to take a whole
  // `MenuItemType`, which meant anything holding just a price — an owner's
  // management row, a submission — had to cast to call it.
  item: { price?: number | string | null } | null | undefined,
): number | null => {
  const price = Number(item?.price);

  if (!Number.isFinite(price) || price <= 0) {
    return null;
  }

  return price;
};

/** The anchor id for the "most loved here" strip. */
export const TOP_SECTION_ID = "menu-top-dishes";

/**
 * A DOM id for a category heading, so the sticky nav can jump to it.
 *
 * Categories come from an AI extraction and arrive as free text - "Small
 * Plates", "Chef's Choice (Omakase)" - so they cannot be used as ids directly.
 */
export const sectionId = (category: string): string =>
  `menu-section-${category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
