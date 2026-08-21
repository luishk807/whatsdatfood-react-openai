import { type FC, lazy, Suspense, useEffect, useState } from "react";
import { SEARCH_LABELS } from "@/customConstants/labels";
import PhotoWall from "@/components/PhotoWall";
import CuisineStrip from "@/components/CuisineStrip";
import QuickDiscovery from "@/components/QuickDiscovery";
import LocationBadge from "@/components/LocationBadge";
import LocationPrompt from "@/components/LocationPrompt";
import LocationSheet from "@/components/LocationSheet";
import TasteOnboarding from "@/components/TasteOnboarding";
import TasteSections from "@/components/TasteSections";
import TrendingStrip from "@/components/TrendingStrip";
import TrendingRestaurants from "@/components/TrendingRestaurants";
import ContributorIntro from "@/components/ContributorIntro";
import useRecentDishPhotos from "@/customHooks/useRecentDishPhotos";
import useCuisineTiles from "@/customHooks/useCuisineTiles";
import useDiscoveryLocation from "@/customHooks/useDiscoveryLocation";
import { useNearbyDiscovery } from "@/customHooks/useNearby";
import useTrendingNearby from "@/customHooks/useTrendingNearby";
import useTastePreferences from "@/customHooks/useTastePreferences";

const LazyMainSearch = lazy(() => import("@/components/MainSearchBar"));

/**
 * The front door.
 *
 * It used to be a heading and a text box centred in an empty white page: no
 * indication that the answer is photographs, and on a phone the entire first
 * screen given over to nothing. The search stays the main action — it is what
 * people came to do — but it sits high, and the food starts immediately under
 * it rather than a scroll away.
 *
 * The order below is the argument the page makes, top to bottom:
 *
 *   search          — you know the restaurant
 *   near me         — you do not, but you know where you are
 *   trending        — what people around here are actually eating
 *   contribute      — how you get your own work onto that list
 *   inspiration     — stock imagery, last, and labelled
 *
 * Real community content sits above generic imagery on purpose. When there is
 * none the trending strip renders nothing and the cuisine tiles are what fills
 * the page, which is the honest ordering rather than a fixed one.
 */
const Homepage: FC = () => {
  const { photos, loading } = useRecentDishPhotos();
  const { tiles, loading: tilesLoading } = useCuisineTiles();
  const { location, nameArea } = useDiscoveryLocation();
  const [changing, setChanging] = useState(false);
  const { discovery, loading: discoveryLoading } = useNearbyDiscovery(location);
  const { trending, loading: trendingLoading } = useTrendingNearby(location);
  const { preferences, categories, loading: tastesLoading } =
    useTastePreferences();

  // The server names the area from the nearest restaurant it knows; the
  // browser only ever had coordinates. Nothing here reverse-geocodes anybody
  // to a street.
  useEffect(() => {
    if (discovery?.area_label) {
      nameArea(discovery.area_label);
    }
  }, [discovery?.area_label, nameArea]);

  /**
   * Every "Change" on this page opens the same sheet.
   *
   * It used to scroll to a control further up, which only worked because that
   * control was permanently on screen. Now that a known location collapses to
   * one line, there is nothing to scroll to — and a sheet is the better answer
   * anyway: the reader keeps their place instead of being sent to the top of
   * the page to answer a question about the section they were reading.
   */
  const changeLocation = () => setChanging(true);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16 pt-8 sm:pt-14">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {SEARCH_LABELS.title}
        </h1>
        <p className="text-sm text-ink-muted sm:text-base">
          {SEARCH_LABELS.subtitle}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-12 w-full animate-pulse rounded-pill bg-surface-sunken" />
        }
      >
        <LazyMainSearch />
      </Suspense>

      {/* Directly under the search, because it answers the other half of the
          question the search asks. Somebody who knows the restaurant types
          its name; somebody who knows they want coffee taps Coffee. The Map
          button sits here too — it used to be reachable only by scrolling
          past three sections, which is a poor way to learn a map exists. */}
      <QuickDiscovery
        categories={categories}
        preferences={preferences}
        loading={tastesLoading}
      />

      {/* Two states, and only ever one of them.
    
          Not knowing where somebody is gets the full pitch; knowing gets one
          line and a way to change it. The old version showed the same pair of
          large buttons in both cases, so a reader who had already answered was
          asked again on every visit, above sections that were already using
          the answer.

          Unmounting the prompt on a fix is safe here, and was not always:
          the earlier bug was that `LocationCue` owned a navigate-on-fix effect
          which could not run once unmounted. Nothing navigates from this page,
          and the request itself belongs to `DiscoveryLocationProvider`, which
          outlives both of these. */}
      {location ? (
        <LocationBadge label={location.label} onChange={changeLocation} />
      ) : (
        <LocationPrompt />
      )}

      <LocationSheet open={changing} onClose={() => setChanging(false)} />

      {/* Asked once, and only once there is somewhere to apply it. Answered,
          it disappears; skipped, it becomes one quiet line and does not ask
          again for a month. */}
      <TasteOnboarding hasLocation={Boolean(location)} />

      {/* What somebody said they like, above the general ranking — that is
          the whole point of having asked. Each strip is the nearby query with
          a cuisine, so the answer for Flushing-and-sushi is shared by
          everybody interested in sushi in Flushing rather than computed per
          reader. Nothing here reaches a model. */}
      <TasteSections
        preferences={preferences}
        location={location}
        place={location?.label}
      />

      {/* Places to go, above the dish strip. Somebody who has not decided
          where to eat cannot use a row of dishes yet, and this is the
          section that answers first. */}
      <TrendingRestaurants
        trending={trending}
        loading={trendingLoading}
        hasLocation={Boolean(location)}
        onChangeLocation={changeLocation}
      />

      <TrendingStrip
        discovery={discovery}
        loading={discoveryLoading}
        hasLocation={Boolean(location)}
        onChangeLocation={changeLocation}
      />

      <PhotoWall photos={photos} loading={loading} />

      <ContributorIntro />

      {/* Below the real photographs, always. When diners have uploaded, their
          work leads and this is a footnote; when they have not, this is the
          difference between a front door that says what the product is and a
          search box floating in white space. */}
      <CuisineStrip tiles={tiles} loading={tilesLoading} />
    </div>
  );
};

export default Homepage;
