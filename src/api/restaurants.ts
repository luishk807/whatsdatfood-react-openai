import { RestaurantType } from "types";
import { BACKEND_URL } from "customConstants";
import { _get } from "utils";
export const getRestaurantByName = async (
  name: string,
): Promise<RestaurantType[]> => {
  try {
    const query = `#graphql
      query GetAiRestaurant($name: String!) {
        aiRestaurantNameList(name: $name) {
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
    const data = _get(json, "data.aiRestaurantNameList", []);

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

export const getRestaurantBySlug = async (
  slug: string,
): Promise<RestaurantType> => {
  try {
    const query = `#graphql
    query getRestaurantBySlug($slug: String) {
      aiRestaurantBySlug(slug: $slug) {
        name
        address
        restRestaurantItems {
            name
            description
            top_choice
            price
            category
        }
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
          slug,
        },
      }),
    });
    const json = await resp.json();
    const data = _get(json, "data.aiRestaurantBySlug");

    console.log(data);
    return data as RestaurantType;
  } catch (err) {
    console.error(err);
    return {} as RestaurantType;
  }
};
