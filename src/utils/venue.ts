import { RestaurantType } from "@/interfaces/restaurants";

/**
 * Which venue facts are worth showing, and in what order.
 *
 * Pure, so the decision is testable on its own: the sheet renders whatever
 * this returns, and an empty result is the honest answer for a restaurant the
 * AI knew only the name of.
 */

/** A single price-range summary, however the record spells it. */
export const priceRange = (restaurant?: RestaurantType | null): string | null => {
  const value = restaurant?.price_range?.trim();
  return value ? value : null;
};

export const michelinStars = (restaurant?: RestaurantType | null): number => {
  const score = Number(restaurant?.michelin_score ?? 0);
  // A bad value is no stars, not NaN stars.
  return Number.isFinite(score) && score > 0 ? Math.floor(score) : 0;
};

/** Rating rounded the way it is displayed, or null when nobody has rated. */
export const displayRating = (
  restaurant?: RestaurantType | null,
): string | null => {
  const rating = Number(restaurant?.rating ?? 0);

  if (!Number.isFinite(rating) || rating <= 0) {
    return null;
  }

  return rating.toFixed(1);
};

export const fullAddress = (restaurant?: RestaurantType | null): string | null => {
  if (!restaurant) {
    return null;
  }

  const line = [
    restaurant.address,
    restaurant.city,
    restaurant.state,
    restaurant.postal_code,
    restaurant.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  return line || null;
};

/**
 * Whether the details sheet has anything to say.
 *
 * A button that opens an empty panel is worse than no button, and plenty of
 * these records carry a name and nothing else.
 */
export const hasDetails = (restaurant?: RestaurantType | null): boolean => {
  if (!restaurant) {
    return false;
  }

  return Boolean(
    fullAddress(restaurant) ||
      restaurant.phone?.trim() ||
      restaurant.website?.trim() ||
      restaurant.payment_method?.trim() ||
      restaurant.description?.trim() ||
      priceRange(restaurant) ||
      michelinStars(restaurant) ||
      restaurant.reservation_required ||
      restaurant.tasting_menu_only ||
      (restaurant.businessHours?.length ?? 0) > 0,
  );
};
