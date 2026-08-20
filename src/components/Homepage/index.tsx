import { type FC, lazy, Suspense, useEffect } from "react";
import { SEARCH_LABELS } from "@/customConstants/labels";
import PhotoWall from "@/components/PhotoWall";
import CuisineStrip from "@/components/CuisineStrip";
import LocationCue from "@/components/LocationCue";
import TrendingStrip from "@/components/TrendingStrip";
import TrendingRestaurants from "@/components/TrendingRestaurants";
import ContributorIntro from "@/components/ContributorIntro";
import useRecentDishPhotos from "@/customHooks/useRecentDishPhotos";
import useCuisineTiles from "@/customHooks/useCuisineTiles";
import useDiscoveryLocation from "@/customHooks/useDiscoveryLocation";
import { useNearbyDiscovery } from "@/customHooks/useNearby";
import useTrendingNearby from "@/customHooks/useTrendingNearby";

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
  const { discovery, loading: discoveryLoading } = useNearbyDiscovery(location);
  const { trending, loading: trendingLoading } = useTrendingNearby(location);

  // The server names the area from the nearest restaurant it knows; the
  // browser only ever had coordinates. Nothing here reverse-geocodes anybody
  // to a street.
  useEffect(() => {
    if (discovery?.area_label) {
      nameArea(discovery.area_label);
    }
  }, [discovery?.area_label, nameArea]);

  /** Both discovery sections send the reader to the same control. */
  const scrollToLocationCue = () =>
    document
      .getElementById("discovery-place-cue")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

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

      {/* Under the search, quieter than it: somebody who knows the name should
          type it, and this is for everybody else.

          Always rendered, never conditionally. It used to be hidden once a
          location was known, which unmounted the component in the same render
          the fix arrived in — so the effect that navigates to the results
          never ran and the button did nothing. */}
      <LocationCue />

      {/* Places to go, above the dish strip. Somebody who has not decided
          where to eat cannot use a row of dishes yet, and this is the
          section that answers first. */}
      <TrendingRestaurants
        trending={trending}
        loading={trendingLoading}
        hasLocation={Boolean(location)}
        onChangeLocation={scrollToLocationCue}
      />

      <TrendingStrip
        discovery={discovery}
        loading={discoveryLoading}
        hasLocation={Boolean(location)}
        onChangeLocation={scrollToLocationCue}
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
