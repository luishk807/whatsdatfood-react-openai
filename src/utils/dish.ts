import { MenuItemType, MenuItemPhoto } from "@/interfaces/restaurants";
import { IMAGE_SOURCE } from "@/customConstants/images";
import { ImageSourceType } from "@/types";

export const getDishPhoto = (item: MenuItemType): MenuItemPhoto | undefined =>
  item.images?.find((photo) => !!photo?.url_m) ?? item.images?.[0];

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
