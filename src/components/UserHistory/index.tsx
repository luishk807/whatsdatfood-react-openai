import { type FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RestaurantCover from "@/components/RestaurantCover";
import useUserViews from "@/customHooks/useUserViews";
import useUserSearches from "@/customHooks/useUseSearch";
import { HISTORY_LABELS } from "@/customConstants/labels";
import { ROUTES, buildMenuResultsPath } from "@/customConstants/routes";
import { UserSearch, UserView } from "@/interfaces/users";
import { groupByDay, recentlyViewed } from "@/utils/history";
import { relativeDay } from "@/utils/time";
import { venueLabel } from "@/utils/venue";
import { _get } from "@/utils";

/**
 * Where somebody has been.
 *
 * It was a name and a formatted timestamp per row, and for a long time it was
 * empty regardless: `record_view` ran *after* the enrichment block in
 * `aiRestaurantBySlug`, and both of that block's failure branches raise. On a
 * catalogue where 6,783 of 6,786 restaurants have no menu, almost every visit
 * tried to generate one, failed, and left without recording the visit - so
 * somebody who had been reading restaurants all day came here to nothing.
 * That is fixed on the server; this is the page it deserved.
 *
 * **One row per restaurant, at the last time it was opened.** A view is
 * recorded on every page open, which is right to store and wrong to print:
 * somebody comparing three places flips between them repeatedly, so a raw
 * list is the same four restaurants over and over with yesterday's pushed off
 * the bottom by their own indecision.
 *
 * **Grouped by day, not stamped by minute.** Nobody wants to know they opened
 * a restaurant at 14:32 on a Tuesday; they want to know whether it was today.
 *
 * **Recent searches are text, not shortcuts.** There is no search-results
 * route - submitting a search navigates straight to a restaurant - so a chip
 * here would have nowhere to go. More importantly, submitting is the one path
 * that may reach the model, and a page of one-tap repeats of every search
 * somebody has ever made is a page of buttons that open the wallet.
 */
const UserHistory: FC = () => {
  const { getViewsByUser, getViewsByUserQuery } = useUserViews();
  const { getSearchByUser } = useUserSearches();

  const [views, setViews] = useState<UserView[] | null>(null);
  const [searches, setSearches] = useState<UserSearch[]>([]);
  const { loading } = getViewsByUserQuery;

  useEffect(() => {
    let live = true;

    getViewsByUser().then((resp) => {
      if (live) {
        setViews(_get<UserView[]>(resp as object, "data", []) ?? []);
      }
    });

    // A failure here is not worth a broken page: the restaurants are the
    // point and the typed strings are a footnote.
    getSearchByUser()
      .then((resp) => {
        if (live) {
          setSearches(_get<UserSearch[]>(resp as object, "data", []) ?? []);
        }
      })
      .catch(() => undefined);

    return () => {
      live = false;
    };
    // Once, on mount. Both hooks hand back fresh function identities on every
    // render, and depending on them is how this codebase has produced a
    // request loop three times.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = groupByDay(recentlyViewed(views ?? []), relativeDay);

  if (loading && views === null) {
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

  if (!groups.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          {HISTORY_LABELS.emptyTitle}
        </p>
        <p className="max-w-sm text-sm text-ink-muted">
          {HISTORY_LABELS.emptyBody}
        </p>
        <Link
          to={ROUTES.nearby}
          className="mt-2 inline-flex min-h-11 items-center rounded-pill border border-ink px-4 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          {HISTORY_LABELS.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {group.label}
            </h2>

            <ul className="flex flex-col gap-2">
              {group.views.map((view) => {
                const restaurant = view.restaurant;
                const where = venueLabel(restaurant);

                return (
                  <li key={view.id}>
                    <Link
                      to={buildMenuResultsPath(restaurant.slug as string)}
                      className="flex items-center gap-3 rounded-card border border-line bg-surface-raised p-3"
                    >
                      <RestaurantCover
                        restaurant={{
                          cuisine: _get<string | null>(
                            restaurant,
                            "cuisine",
                            null,
                          ),
                        }}
                        ratio={undefined}
                        className="h-20 w-20 shrink-0"
                      />

                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-ink">
                          {restaurant.name}
                        </span>
                        {where && (
                          <span className="truncate text-xs text-ink-muted">
                            {where}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {searches.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {HISTORY_LABELS.searchesTitle}
          </h2>

          {/* Deliberately not links. See the note at the top of this file. */}
          <ul className="flex flex-wrap gap-2">
            {searches.map((search) => (
              <li
                key={search.id}
                className="rounded-pill border border-line px-3 py-1.5 text-sm text-ink-muted"
              >
                {search.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default UserHistory;
