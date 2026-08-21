import { TasteCategoryType } from "@/interfaces/tastes";

/**
 * A slug as a last-resort label.
 *
 * `dim_sum` rendered as "Dim_sum" in the page heading, in the filter chip and
 * in the empty state, because the only thing standing between the URL and the
 * reader was `value.charAt(0).toUpperCase()`. Every category whose slug is
 * more than one word had the same problem.
 *
 * This is the fallback, not the answer — see `categoryLabel`. It runs before
 * the category list has loaded and for a slug the server does not know, which
 * is why it stays a dumb, predictable transformation rather than a second
 * table of names to drift from the first.
 */
export const humanizeSlug = (slug: string): string =>
  slug
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/**
 * What to call a category on screen.
 *
 * **The server's name wins, always.** `taste_categories` holds "Dim Sum" and
 * "BBQ", and those are the strings the picker already shows — deriving a
 * second version of them in the browser is how the same category ends up
 * called two things on two pages. It is the rule the trending section and the
 * reputation levels already follow, for the same reason.
 *
 * Reading it costs nothing: the category list is seventeen rows, cache-first,
 * and the page that needs this label has usually loaded it already.
 */
export const categoryLabel = (
  slug: string,
  categories: TasteCategoryType[] = [],
): string =>
  categories.find((one) => one.slug === slug)?.name ?? humanizeSlug(slug);
