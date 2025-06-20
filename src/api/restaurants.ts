import { RestaurantType } from "types";
import { BACKEND_URL } from "customConstant";
export const getRestaurantByName = async (name: string) => {
  try {
    const resp = await fetch(
      `${BACKEND_URL}/open-ai/get-restaurant-list?restaurant=${name}&limit=10&page=1`,
    );
    return await resp.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getRestaurantBySlug = async (
  slug: string,
): Promise<RestaurantType> => {
  const resp = await fetch(
    `${BACKEND_URL}/restaurants/find?restaurant=${slug}`,
  );
  return await resp.json();
};
