import { MenuItemType } from "@/interfaces/restaurants";
import { DIETARY_LABELS } from "@/customConstants/labels";

export type DietaryTagTone = "positive" | "warning";

export interface DietaryTag {
  key: string;
  label: string;
  tone: DietaryTagTone;
}

const SPICE_MAX = 3;

/**
 * The tags worth showing for a dish.
 *
 * Two rules, both about safety rather than tidiness:
 *
 * 1. **Only explicit `true` produces a tag.** `null` means nobody has said,
 *    and `false` from a language model is a guess. Neither is evidence.
 * 2. **No absence claims.** There is deliberately no "nut free" tag. Someone
 *    with an allergy must not read the lack of a warning as a guarantee, and a
 *    tag saying so would invite exactly that.
 */
export const getDietaryTags = (item: MenuItemType): DietaryTag[] => {
  const tags: DietaryTag[] = [];

  if (item.is_vegan === true) {
    tags.push({ key: "vegan", label: DIETARY_LABELS.vegan, tone: "positive" });
  } else if (item.is_vegetarian === true) {
    // Vegan implies vegetarian; showing both is noise.
    tags.push({
      key: "vegetarian",
      label: DIETARY_LABELS.vegetarian,
      tone: "positive",
    });
  }

  if (item.is_gluten_free === true) {
    tags.push({
      key: "gluten_free",
      label: DIETARY_LABELS.glutenFree,
      tone: "positive",
    });
  }

  if (item.contains_nuts === true) {
    tags.push({
      key: "nuts",
      label: DIETARY_LABELS.containsNuts,
      tone: "warning",
    });
  }

  if (item.contains_shellfish === true) {
    tags.push({
      key: "shellfish",
      label: DIETARY_LABELS.containsShellfish,
      tone: "warning",
    });
  }

  if (item.contains_dairy === true) {
    tags.push({
      key: "dairy",
      label: DIETARY_LABELS.containsDairy,
      tone: "warning",
    });
  }

  return tags;
};

/** Spice label, or null when unknown or explicitly none. */
export const getSpiceLabel = (item: MenuItemType): string | null => {
  const level = item.spice_level;

  if (typeof level !== "number" || level <= 0 || level > SPICE_MAX) {
    return null;
  }

  return DIETARY_LABELS.spice[level] ?? null;
};

/** Whether the kitchen said so, rather than a model guessing. */
export const isConfirmedByRestaurant = (item: MenuItemType): boolean =>
  item.dietary_source === "owner";

export const hasDietaryInfo = (item: MenuItemType): boolean =>
  getDietaryTags(item).length > 0 || getSpiceLabel(item) !== null;
