import { FoodCategorySourceType } from "@/interfaces/imagery";

/**
 * What kind of place a restaurant is, for the purpose of drawing an icon.
 *
 * **Why this exists.** `cuisine` is null on most of the catalogue — the
 * classifier derives it from a restaurant's *menu*, and 6,783 of the 6,786
 * imported restaurants have no menu — so keying an icon on it alone gave the
 * generic fork and knife to nearly everything. Twelve restaurants in Flushing:
 * seven had no cuisine, including Dunkin', a bagel cafe and a hot pot place.
 *
 * **It answers a smaller question than `cuisines.py` does, on purpose.** That
 * module decides what a kitchen *serves* and refuses to guess, because being
 * wrong there puts a steakhouse under a Chinese tile and costs a reader a
 * journey. This decides which of eleven line drawings to put in a 32px box.
 * Being wrong costs a slightly odd glyph, so it can use evidence that would be
 * far too weak for the other question — while still refusing anything genuinely
 * ambiguous.
 *
 * The order is structured data first, and a name is only ever consulted when
 * there is nothing better:
 *
 *   1. the `cuisine` column, where the classifier committed to one
 *   2. an unambiguous token in the name
 *   3. null, and the caller draws crossed cutlery
 *
 * **One resolver, four surfaces.** The taste picker, the homepage tiles, the
 * nearby list and the map markers all come through here, so "Coffee" is the
 * same drawing in all four. Scattering the rules would guarantee they drift.
 */

/**
 * A cuisine the classifier committed to, mapped to a drawable category.
 *
 * Mostly identity — the cuisine slugs and the taste-category slugs were
 * deliberately made the same strings — so this exists for the ones that are
 * not, and as the place a future cuisine lands.
 */
const CUISINE_ALIASES: Record<string, string> = {
  chinese: "chinese",
  italian: "italian",
  japanese: "japanese",
  korean: "korean",
  mexican: "mexican",
  thai: "thai",
  indian: "indian",
  american: "american",
  cafe: "coffee",
  coffee: "coffee",
  coffee_shop: "coffee",
  bakery: "bakeries",
  bagel_shop: "bakeries",
  sushi: "sushi",
  ramen: "ramen",
  noodle: "ramen",
  pizza: "pizza",
  burger: "burgers",
  dim_sum: "dim_sum",
  dumpling: "dim_sum",
  hot_pot: "bbq",
  bbq: "bbq",
  dessert: "desserts",
};

/**
 * Tokens that mean one thing and are worth acting on, most specific first.
 *
 * **Deliberately conservative.** Every token here names a dish or a kind of
 * shop rather than a place or an adjective: "sushi" is evidence, "golden" and
 * "empire" and "house" are not. `cuisines.py` learned this the expensive way —
 * "Chinese Kitchen" is Chinese and "China Bistro Pizza" is not — so nothing
 * here tries to infer a *cuisine* from a name. It infers a shop type, which is
 * a much lower bar and the reason a name is admissible evidence at all.
 *
 * Matched on word boundaries, so "pho" does not match "phoenix" and "bao" does
 * not match "baobab".
 */
const NAME_RULES: ReadonlyArray<readonly [string, RegExp]> = [
  ["sushi", /\b(sushi|sashimi|omakase)\b/],
  ["ramen", /\b(ramen|pho|udon|soba|noodle|noodles)\b/],
  ["dim_sum", /\b(dim sum|dimsum|dumpling|dumplings|xiao long bao)\b/],
  ["pizza", /\b(pizza|pizzeria)\b/],
  ["burgers", /\b(burger|burgers)\b/],
  ["bbq", /\b(bbq|barbecue|barbeque|hot pot|hotpot)\b/],
  ["mexican", /\b(taco|tacos|taqueria|burrito)\b/],
  // Before the bakery tokens, so "Dunkin' Donuts" and "Oh! Bagel Cafe" both
  // land on the cup rather than splitting between two near-identical answers.
  ["coffee", /\b(coffee|cafe|café|espresso|roasters|roastery|dunkin|starbucks)\b/],
  ["bakeries", /\b(bagel|bagels|bakery|boulangerie|patisserie|donut|donuts|doughnut|croissant)\b/],
  ["desserts", /\b(dessert|desserts|ice cream|gelato|creamery)\b/],
];

/**
 * The category to draw for a restaurant, or null when nothing is confident.
 *
 * Null is a real answer and the caller renders crossed cutlery for it —
 * "we do not know what this place is" is honest, and the generic icon means
 * exactly that rather than being the default for two thirds of the map.
 */
export const resolveFoodCategory = (
  restaurant: FoodCategorySourceType,
): string | null => {
  const cuisine = (restaurant.cuisine || "").trim().toLowerCase();

  if (cuisine && CUISINE_ALIASES[cuisine]) {
    return CUISINE_ALIASES[cuisine];
  }

  // A cuisine we hold but have no drawing for is still structured data, so it
  // is returned as-is and the icon map falls back on its own. A new cuisine on
  // the server therefore never has to be added here to behave sensibly.
  if (cuisine) {
    return cuisine;
  }

  const name = (restaurant.name || "").trim().toLowerCase();

  if (!name) {
    return null;
  }

  const matched = NAME_RULES.find(([, pattern]) => pattern.test(name));

  return matched ? matched[0] : null;
};
