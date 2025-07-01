import { RestaurantType } from "types";
import { BACKEND_URL } from "customConstants";
import { _get } from "utils";
export const getRestaurantByName = async (
  name: string,
): Promise<RestaurantType[]> => {
  try {
    const query = `#graphql
      query GetAiRestaurant($name: String!) {
        aiRestaurant(name: $name) {
          name
          address
          city
          state
          postal_code
          slug
        }
      }
    `;
    const resp = await fetch(`${BACKEND_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          name,
        },
      }),
    });

    const json = await resp.json();
    const data = _get(json, "data.aiRestaurant", []);

    if (!Array.isArray(data)) {
      console.error("expected array but got: ", data);
      return [];
    }
    return data as RestaurantType[];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getRestaurantMenuItemsBySlug = async (slug: string) => {
  const query = `#graphql
    query getRestaurantMenuItems($slug: String!) {
      
    }
  `
};

export const getRestaurantBySlug = async (
  slug: string,
): Promise<RestaurantType> => {
  const resp = await fetch(
    `${BACKEND_URL}/restaurants/find?restaurant=${slug}`,
  );
  return await resp.json();
};
