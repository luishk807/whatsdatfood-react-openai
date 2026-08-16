import { MenuItemType, MenuItemPhoto } from "@/interfaces/restaurants";
import { IMAGE_SOURCE } from "@/customConstants/images";
import { ImageSourceType } from "@/types";

export const getDishPhoto = (item: MenuItemType): MenuItemPhoto | undefined =>
  item.images?.find((photo) => !!photo?.url_m) ?? item.images?.[0];

export const getDishPhotoUrl = (item: MenuItemType): string | null =>
  getDishPhoto(item)?.url_m ?? item.image ?? null;

/**
 * Every photo in the database today came from an image search, so nothing is
 * community-sourced yet. Uploads will set this per photo.
 */
export const getDishPhotoSource = (
  item: MenuItemType,
): ImageSourceType | undefined =>
  getDishPhotoUrl(item) ? IMAGE_SOURCE.stock : undefined;

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
