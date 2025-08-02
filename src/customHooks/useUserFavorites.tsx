import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_USER_FAVORITES,
  CHECK_IF_FAVORITES,
  GET_USER_FAVORITES,
} from "@/graphql/queries/users";
import { LIMIT_DEFAULT, PAGE_DEFAULT } from "@/customConstants";
import { _get } from "@/utils";

const useUserFavorite = () => {
  const [
    createUserFavorites,
    {
      loading: createUserFavoritesLoading,
      error: createUserFavoritesError,
      data: createUserFavoritesData,
    },
  ] = useMutation(ADD_USER_FAVORITES);

  const [
    checkIfUserFavorite,
    {
      loading: checkUserFavoriteLoading,
      error: checkUserFavoriteError,
      data: checkUserFavoriteData,
    },
  ] = useLazyQuery(CHECK_IF_FAVORITES, {
    fetchPolicy: "network-only",
  });

  const [
    getUserFavorites,
    {
      loading: getUserFavoritesLoading,
      error: getUserFavoritesError,
      data: getUserFavoritesData,
    },
  ] = useLazyQuery(GET_USER_FAVORITES, {
    fetchPolicy: "network-only",
  });

  const saveFavorites = async (slug: string) => {
    try {
      if (!slug) {
        console.error("Invalid slug passed to saveFavorites:", slug);
        throw new Error("Slug is required");
      }

      const resp = await createUserFavorites({
        variables: {
          input: {
            slug: slug,
          },
        },
      });

      return _get(resp, "data.addUserFavorites");
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("ERROR: unable to save user favorites");
    }
  };

  const getAllUserFavorites = async (page?: number, limit?: number) => {
    try {
      const resp = await getUserFavorites({
        variables: {
          page: page || PAGE_DEFAULT,
          limit: limit || LIMIT_DEFAULT,
        },
      });

      return _get(resp, "data.getUserFavoritesByUser");
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("ERROR: unable to get user favorites");
    }
  };

  const isUserFavorite = async (slug: string) => {
    try {
      const resp = await checkIfUserFavorite({
        variables: {
          slug: slug,
        },
      });

      return _get(resp, "data.checkUserFavoriteBySlug");
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }

      throw new Error("ERROR: unablet to check user favorite");
    }
  };
  return {
    isUserFavorite,
    saveFavorites,
    getAllUserFavorites,
    getAllUserFavoritesQuery: {
      loading: getUserFavoritesLoading,
      error: getUserFavoritesError,
      data: getUserFavoritesData,
    },
    submitUserFavoritesQuery: {
      loading: createUserFavoritesLoading,
      error: createUserFavoritesError,
      data: createUserFavoritesData,
    },
    checkUserFavoritesQuery: {
      loading: checkUserFavoriteLoading,
      error: checkUserFavoriteError,
      data: checkUserFavoriteData,
    },
  };
};

export default useUserFavorite;
