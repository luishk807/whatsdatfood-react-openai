import { RestaurantType, RestaurantItemImageType } from "@/types/restaurants";

import { _get } from "@/utils";
import { useMutation } from "@apollo/client";
import {
  GET_RESTAURANTS_BY_NAME,
  GET_RESTAURANT_BY_SLUG,
  GET_RESTAURANT_IMAGES,
} from "@/graphql/queries/restaurants";
export const getRestaurantByName = async (
  name: string,
): Promise<RestaurantType[]> => {
  try {
    const [GetAiRestaurant] = useMutation(GET_RESTAURANTS_BY_NAME);
    const { data } = await GetAiRestaurant({
      variables: {
        name,
      },
    });

    const resp = _get(data, "GetAiRestaurant");
    console.log("getRestaurantByName", resp);
    return resp as RestaurantType[];
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("unable to find restaurant");
  }
};

export const getRestaurantBySlug = async (
  slug: string,
): Promise<RestaurantType> => {
  try {
    const [getRestaurantBySlug] = useMutation(GET_RESTAURANT_BY_SLUG);
    const { data } = await getRestaurantBySlug({
      variables: {
        slug,
      },
    });

    const resp = _get(data, "getRestaurantBySlug");
    console.log("getRestaurantBySlug", data);
    return resp as RestaurantType;
  } catch (err) {
    console.error(err);
    return {} as RestaurantType;
  }
};

export const getRestaurantItemImages = async (
  restItemId: number,
): Promise<RestaurantItemImageType | null> => {
  if (!restItemId) {
    throw null;
  }

  try {
    const [getRestaurantImages] = useMutation(GET_RESTAURANT_IMAGES);
    const { data } = await getRestaurantImages({
      variables: {
        restItemId,
      },
    });

    const resp = _get(data, "getRestaurantImages");

    console.log("getRestaurantItemImages", resp);
    if (!resp) {
      console.warn("No image found for restaurant item:", restItemId);
      return null;
    }

    return data as RestaurantItemImageType;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }

    throw new Error("ERROR: unable to get restaurant imges");
  }
};
