import { type FC } from "react";
import {
  BakeryIcon,
  BbqIcon,
  BrunchIcon,
  BurgerIcon,
  CoffeeIcon,
  DessertIcon,
  FlameIcon,
  PizzaIcon,
  SaladIcon,
  SoupIcon,
  UtensilsIcon,
  WheatIcon,
} from "@/components/icons";
import {
  DumplingIcon,
  NoodlesIcon,
  SushiIcon,
  TacoIcon,
} from "@/components/icons/food";
import { IconInterface } from "@/interfaces/icons";

/**
 * What a food category looks like, and the only place that decides.
 *
 * **The database stores `coffee`, never `CoffeeIcon`.** A category is a slug,
 * a name and a type on the server; how it is drawn is a decision this file
 * makes and can remake. That separation is what lets commissioned WhatsDatFood
 * artwork replace any of these later with no migration and no change to
 * anybody's saved preferences — the seam is one entry in this object.
 *
 * It is used in three places that would otherwise each grow their own copy:
 * the taste picker, the cuisine tiles, and the branded fallback drawn on a
 * restaurant card with no photograph.
 *
 * **No flags.** Cuisine does not map cleanly onto nationality — a Chinese
 * restaurant in Flushing is a Queens restaurant — and a flag makes a claim
 * about a country where the card is about food. Every cuisine here is drawn as
 * something you would eat.
 *
 * A category legitimately shares a glyph with a related one: `sushi` and
 * `japanese` are the same picture because they are the same picture. They
 * never appear in the same group, so nothing is ambiguous at the point of
 * choosing.
 */
export const foodCategoryIcons: Record<string, FC<IconInterface>> = {
  // What somebody is in the mood for.
  coffee: CoffeeIcon,
  sushi: SushiIcon,
  ramen: NoodlesIcon,
  dim_sum: DumplingIcon,
  pizza: PizzaIcon,
  desserts: DessertIcon,
  bakeries: BakeryIcon,
  burgers: BurgerIcon,
  bbq: BbqIcon,
  brunch: BrunchIcon,

  // Cuisines, drawn as a dish rather than a country.
  chinese: DumplingIcon,
  italian: WheatIcon,
  japanese: SushiIcon,
  korean: FlameIcon,
  mexican: TacoIcon,
  thai: SaladIcon,
  indian: SoupIcon,
  american: BurgerIcon,
};

/**
 * The glyph for a category, or crossed cutlery for one we have no drawing for.
 *
 * Never null: the caller is filling a tile that has already been reserved, and
 * a hole there is the empty grey rectangle this whole system exists to remove.
 * A new category invented on the server therefore renders sensibly the day it
 * appears, before anybody has drawn anything for it.
 */
export const foodCategoryIcon = (slug?: string | null): FC<IconInterface> =>
  foodCategoryIcons[(slug || "").trim().toLowerCase()] ?? UtensilsIcon;
