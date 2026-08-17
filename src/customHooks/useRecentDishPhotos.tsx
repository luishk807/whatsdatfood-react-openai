import { useQuery } from "@apollo/client";
import { GET_RECENT_DISH_PHOTOS } from "@/graphql/queries/restaurants";
import { ShowcasePhoto } from "@/interfaces/ranking";
import { SHOWCASE } from "@/customConstants/images";
import { _get } from "@/utils";

/**
 * Photos for the front door.
 *
 * Cache-first on purpose. This is the one page every visitor loads, the wall is
 * an invitation rather than the product, and a photo that is a few minutes
 * stale is indistinguishable from a fresh one.
 *
 * A failure returns an empty list rather than propagating: the homepage still
 * has to render its search box, which is what people came to use.
 */
const useRecentDishPhotos = (limit: number = SHOWCASE.LIMIT) => {
  const { data, loading, error } = useQuery(GET_RECENT_DISH_PHOTOS, {
    variables: { limit },
    fetchPolicy: "cache-first",
  });

  const photos = _get<ShowcasePhoto[]>(data, "recentDishPhotos", []) ?? [];

  return {
    // A tile with no picture is a grey box on the front door, so drop it here
    // rather than asking the wall to reason about it.
    photos: photos.filter((photo) => !!(photo.url_s || photo.url_m)),
    loading,
    error,
  };
};

export default useRecentDishPhotos;
