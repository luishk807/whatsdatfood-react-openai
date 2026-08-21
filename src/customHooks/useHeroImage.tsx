import { useMemo } from "react";
import useCuisineTiles from "@/customHooks/useCuisineTiles";
import useRecentDishPhotos from "@/customHooks/useRecentDishPhotos";
import { HERO_POOL } from "@/customConstants/images";
import { pickHeroImage } from "@/utils/heroImage";
import { HeroImageType } from "@/interfaces/imagery";

/**
 * One photograph for a large decorative panel.
 *
 * **Both sources already existed and both are already cached.** The community
 * pool is the homepage wall's query and the curated pool is the cuisine
 * strip's, each `cache-first` and each answered from our own rows — so a
 * visitor who lands on the sign-in page having already seen the front door
 * pays nothing at all, and one who lands on it cold pays two indexed reads.
 *
 * **Neither can reach Unsplash.** `GenericImageService.tiles()` is a single
 * query; the provider is only ever called by `refresh()`, which runs from a
 * script or a cron. Opening this page a million times costs no third-party
 * requests, which is the property that made reusing this collection the right
 * answer rather than fetching a hero of its own.
 *
 * Selection lives in `utils/heroImage.ts` so it can be tested without a
 * component and reused by anything else that wants the same hierarchy.
 */
const useHeroImage = (): {
  image: HeroImageType | null;
  loading: boolean;
} => {
  const { photos, loading: photosLoading } = useRecentDishPhotos(HERO_POOL);
  const { tiles, loading: tilesLoading } = useCuisineTiles();

  const image = useMemo(
    () => pickHeroImage({ community: photos, curated: tiles }),
    [photos, tiles],
  );

  return {
    image,
    // Both, because the fallback is only correct once we know the community
    // pool is genuinely empty. Resolving early would show an Unsplash image
    // for a moment and then swap it for a diner's, which reads as a glitch.
    loading: photosLoading || tilesLoading,
  };
};

export default useHeroImage;
