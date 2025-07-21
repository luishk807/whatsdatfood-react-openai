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
  ] = useLazyQuery(GET_RESTAURANTS_BY_NAME, {
    fetchPolicy: "network-only",
  });

  const [
    GetAiRestaurantBySlug,
    {
      data: restaurantSlugData,
      loading: restaurantSlugLoading,
      error: restaurantSlugError,
    },
  ] = useLazyQuery(GET_RESTAURANT_BY_SLUG, {
    fetchPolicy: "network-only",
  });

  const [
    GetAiRestaurantByImageById,
    {
      data: restaurantImageData,
      loading: restaurantImageLoading,
      error: restaurantImageError,
    },
  ] = useLazyQuery(GET_RESTAURANT_IMAGES, {
    fetchPolicy: "network-only",
  });

  const getRestaurantListByName = async (name: string) => {
    const resp = await GetAiRestaurantByName({
      variables: {
        name,
      },
    });

    const data = _get(resp, "data.aiRestaurantNameList");
    return Array.isArray(data) ? data : [];
  };

  const getRestaurantListBySlug = async (slug: string) => {
    const resp = await GetAiRestaurantBySlug({
      variables: {
        slug,
      },
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
