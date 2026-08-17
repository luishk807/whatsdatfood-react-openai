import { useLazyQuery } from "@apollo/client";
import {
  GET_RESTAURANT_BY_SLUG,
  GET_RESTAURANTS_BY_NAME,
  GET_RESTAURANT_IMAGES,
} from "@/graphql/queries/restaurants";
import { _get } from "@/utils";

const useRestaurantMutation = () => {
  const [
    GetAiRestaurantByName,
    {
      data: restaurantNameData,
      loading: restaurantNameLoading,
      error: restaurantNameError,
    },
    // Cached result shows immediately, then refreshes in the background.
    // network-only made every repeat search wait on a round trip.
  ] = useLazyQuery(GET_RESTAURANTS_BY_NAME, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const [
    GetAiRestaurantBySlug,
    {
      data: restaurantSlugData,
      loading: restaurantSlugLoading,
      error: restaurantSlugError,
    },
  ] = useLazyQuery(GET_RESTAURANT_BY_SLUG);

  const [
    GetAiRestaurantByImageById,
    {
      data: restaurantImageData,
      loading: restaurantImageLoading,
      error: restaurantImageError,
    },
  ] = useLazyQuery(GET_RESTAURANT_IMAGES);

  /**
   * `generate` false is the type-ahead path: look in the database, never ask
   * the model. True is what a deliberate submit does.
   */
  const getRestaurantListByName = async (name: string, generate = true) => {
    const resp = await GetAiRestaurantByName({
      variables: {
        name,
        generate,
      },
    });

    const data = _get(resp, "data.aiRestaurantNameList");
    return Array.isArray(data) ? data : [];
  };

  /**
   * Served from cache by default — a menu costs the backend an AI call when it
   * is cold. Pass forceNetwork after a write so the change is actually seen.
   */
  const getRestaurantListBySlug = async (
    slug: string,
    forceNetwork?: boolean,
  ) => {
    const resp = await GetAiRestaurantBySlug({
      variables: {
        slug,
      },
      ...(forceNetwork && { fetchPolicy: "network-only" as const }),
    });

    const data = _get(resp, "data.aiRestaurantBySlug");
    return data || {};
  };

  const getRestaurantImageById = async (id: number) => {
    const resp = await GetAiRestaurantByImageById({
      variables: {
        restItemId: id,
      },
    });

    const data = _get(resp, "data.getRestaurantImage");
    return data || {};
  };

  return {
    getRestaurantListByName,
    getRestaurantListByNameQuery: {
      data: restaurantNameData,
      loading: restaurantNameLoading,
      error: restaurantNameError,
    },
    getRestaurantListBySlug,
    getRestaurantListBySlugQuery: {
      data: restaurantSlugData,
      loading: restaurantSlugLoading,
      error: restaurantSlugError,
    },
    getRestaurantImageById,
    getRestaurantListByImageQuery: {
      data: restaurantImageData,
      loading: restaurantImageLoading,
      error: restaurantImageError,
    },
  };
};

export default useRestaurantMutation;
