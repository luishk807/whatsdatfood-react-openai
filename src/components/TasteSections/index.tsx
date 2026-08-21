import { type FC, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@/components/icons";
import RestaurantCover from "@/components/RestaurantCover";
import { foodCategoryIcon } from "@/customConstants/foodIcons";
import { LOCATION_LABELS, TASTE_LABELS } from "@/customConstants/labels";
import { TASTE_SECTIONS } from "@/customConstants/tastes";
import { buildMenuResultsPath, buildNearbyPath } from "@/customConstants/routes";
import { useNearbyRestaurants } from "@/customHooks/useNearby";
import { orderedTastes } from "@/utils/tastes";
import { milesFrom } from "@/utils/distance";
import {
  TasteSectionInterface,
  TasteSectionsInterface,
} from "@/interfaces/tastes";

/**
 * A homepage that knows what somebody likes.
 *
 * **It is the nearby query with a cuisine, and nothing more.** No new
 * pipeline, no second ranking, and above all no model: "Sushi near you" is
 * `nearbyRestaurants(cuisine: "japanese")`, which is a bounding box and an
 * indexed column. The answer for Flushing-and-sushi is the same answer for
 * everybody interested in sushi in Flushing, so it is shared through the
 * Apollo cache rather than computed per reader. Personalisation that cost a
 * request per visitor would be a bill that scales with traffic instead of with
 * use.
 *
 * **Two to four sections, never one per taste.** Somebody who picked eight
 * things does not want eight strips; at that point the page stops being a
 * recommendation and becomes an index, and the whole argument for the homepage
 * is that it decides *for* you. Explicit choices lead, so what somebody
 * actually said outranks anything we merely inferred.
 *
 * **The wording is careful on purpose.** "Worth trying", never "the best".
 * 6,783 of 6,786 restaurants in this catalogue have no menu and barely anything
 * has been voted on — a superlative here is a claim the data cannot support,
 * and a product that overclaims once is not believed the next time. Stronger
 * rankings are earned later, by votes and photographs that exist.
 */
const TasteSection: FC<TasteSectionInterface> = ({ taste, location }) => {
  const { places, loading } = useNearbyRestaurants(location, taste.slug);
  const Glyph = foodCategoryIcon(taste.slug);

  // Nothing found is silence, not an apology. A heading over an empty row
  // makes the catalogue look broken rather than uneven.
  if (loading || !places.length) {
    return null;
  }

  return (
    // Tighter above, looser below: the gap between a heading and its own
    // cards has to read as smaller than the gap to the section before it, or
    // the eye cannot tell which cards belong to which category.
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        {/* The category is the whole heading. It used to be "Coffee near
            Flushing", "Sushi near Flushing" - three identical words repeated
            down the page at the same weight as the one word that tells the
            sections apart. The place is established once, above. */}
        <h3 className="flex min-w-0 items-center gap-2 text-base font-semibold text-ink">
          <Glyph size={20} className="shrink-0 text-ink" />
          <span className="truncate">
            {TASTE_LABELS.sectionTitle(taste.name)}
          </span>
        </h3>

        {/* Aligned with the middle of the title rather than its baseline, and
            in `ink` rather than `ink-muted` - it was grey-on-grey at 12px,
            which is both hard to read and hard to notice. */}
        <Link
          to={buildNearbyPath({ cuisine: taste.slug })}
          className="inline-flex min-h-11 shrink-0 items-center gap-0.5 text-sm font-medium text-ink hover:underline hover:underline-offset-2"
        >
          {TASTE_LABELS.seeAll}
          <ChevronRightIcon size={15} />
        </Link>
      </div>

      {/* A swipe on a phone, a grid once there is width — the same shape as
          every other strip on this page. */}
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {places.slice(0, 4).map((one) => (
          <li key={one.id} className="w-40 shrink-0 snap-start sm:w-auto">
            <Link
              to={one.slug ? buildMenuResultsPath(one.slug) : "#"}
              className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface-raised"
            >
              <RestaurantCover
                restaurant={one}
                ratio={undefined}
                rounded="rounded-none"
                className="h-24 w-full shrink-0"
              />

              <span className="flex flex-1 flex-col gap-0.5 p-2">
                <span className="truncate text-sm font-medium text-ink">
                  {one.name}
                </span>
                <span className="mt-auto truncate pt-1 text-xs text-ink-muted">
                  {LOCATION_LABELS.miles(milesFrom(one.distance_km))}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

const TasteSections: FC<TasteSectionsInterface> = ({
  preferences,
  location,
  place,
}) => {
  // Explicit first, then capped. What somebody said outranks what we guessed,
  // and four strips is where a recommendation becomes an index.
  const shown = useMemo(
    () => orderedTastes(preferences).slice(0, TASTE_SECTIONS.MAX),
    [preferences],
  );

  if (!location || !shown.length) {
    return null;
  }

  return (
    <section aria-labelledby="for-you" className="flex flex-col gap-7">
      <h2 id="for-you" className="text-sm font-semibold text-ink">
        {place ? TASTE_LABELS.forYou(place) : TASTE_LABELS.forYouGeneric}
      </h2>

      {shown.map((taste) => (
        <TasteSection
          key={taste.slug}
          taste={taste}
          location={location}
        />
      ))}
    </section>
  );
};

export default TasteSections;
