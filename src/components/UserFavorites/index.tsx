import { type FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BookmarkButton from "@/components/BookmarkButton";
import RestaurantCover from "@/components/RestaurantCover";
import useUserFavorite from "@/customHooks/useUserFavorites";
import { FAVORITE_LABELS } from "@/customConstants/labels";
import { ROUTES, buildMenuResultsPath } from "@/customConstants/routes";
import { UserFavorites } from "@/interfaces/users";
import { venueLabel } from "@/utils/venue";
import { _get } from "@/utils";

/**
 * The restaurants somebody kept.
 *
 * It was three columns - a name, the date it was saved, and the literal word
 * "delete" - which made a saved restaurant look like a row in an admin table
 * and said nothing at all about the food. The date answered a question nobody
 * asks: a person opening this is deciding where to eat tonight, not auditing
 * when they pressed a heart.
 *
 * **Cards, with the photograph the rest of the product already knows how to
 * find.** `RestaurantCover` walks community photo → owner cover → Google →
 * logo → our own cuisine artwork, so a saved restaurant looks like the same
 * restaurant it looked like on the page it was saved from.
 *
 * **The heart is the control, and it is the same heart.** `BookmarkButton`
 * already owns saving, unsaving, the signed-out case and the toast; a
 * "delete" link here would be a second implementation of one of them, and the
 * one place they could disagree is the one that removes something.
 *
 * **Unsaving takes the card away immediately.** This is a list *of* saved
 * restaurants, so a row that stays after being unsaved is the list contra-
 * dicting itself - and refetching to discover that costs a request to be told
 * what the tap already said.
 */
const UserFavoritesSection: FC = () => {
  const { getAllUserFavorites, getAllUserFavoritesQuery } = useUserFavorite();
  const { loading } = getAllUserFavoritesQuery;
  const [favorites, setFavorites] = useState<UserFavorites[] | null>(null);

  useEffect(() => {
    let live = true;

    getAllUserFavorites().then((resp) => {
      if (!live) {
        return;
      }

      setFavorites(_get<UserFavorites[]>(resp as object, "data", []) ?? []);
    });

    return () => {
      live = false;
    };
    // Once, on mount. The hook hands back a fresh function identity on every
    // render, and depending on it is how this codebase has produced a request
    // loop three times.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drop = (id: number) =>
    setFavorites((current) =>
      (current ?? []).filter((favorite) => favorite.id !== id),
    );

  if (loading && favorites === null) {
    return (
      <ul className="flex flex-col gap-2">
        {[0, 1, 2].map((row) => (
          <li
            key={row}
            className="h-24 animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none"
          />
        ))}
      </ul>
    );
  }

  // Not an apology, and not a dead end. Somebody with nothing saved needs a
  // way to find something worth saving, which is one tap from here.
  if (!favorites?.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          {FAVORITE_LABELS.emptyTitle}
        </p>
        <p className="max-w-sm text-sm text-ink-muted">
          {FAVORITE_LABELS.emptyBody}
        </p>
        <Link
          to={ROUTES.nearby}
          className="mt-2 inline-flex min-h-11 items-center rounded-pill border border-ink px-4 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          {FAVORITE_LABELS.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {favorites.map((favorite) => {
        const restaurant = favorite.restaurant;
        const slug = restaurant?.slug ?? "";
        const where = venueLabel(restaurant);

        return (
          <li
            key={favorite.id}
            className="flex items-center gap-3 rounded-card border border-line bg-surface-raised p-3"
          >
            {/* The card is a link to the food; the heart is a sibling, never
                nested inside it. A button inside a link is invalid and
                browsers resolve it by dropping one. */}
            <Link
              to={slug ? buildMenuResultsPath(slug) : "#"}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              {/* `RestaurantType` carries none of the imagery fields, so
                  every saved card resolves to our own cuisine artwork rather
                  than a broken box - which is what `restaurantImage` promises:
                  the fallback is always last and always present. The named
                  fields are here so this starts working the moment the
                  favourites query returns them. */}
              <RestaurantCover
                restaurant={{
                  cuisine: _get<string | null>(restaurant, "cuisine", null),
                  logo_url: _get<string | null>(restaurant, "logo_url", null),
                  top_dish_photo_url: _get<string | null>(
                    restaurant,
                    "top_dish_photo_url",
                    null,
                  ),
                }}
                ratio={undefined}
                className="h-20 w-20 shrink-0"
              />

              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-ink">
                  {restaurant?.name}
                </span>
                {where && (
                  <span className="truncate text-xs text-ink-muted">
                    {where}
                  </span>
                )}
              </span>
            </Link>

            <BookmarkButton
              slug={slug}
              defaultValue
              onChange={(saved) => {
                if (!saved) {
                  drop(favorite.id);
                }
              }}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default UserFavoritesSection;
