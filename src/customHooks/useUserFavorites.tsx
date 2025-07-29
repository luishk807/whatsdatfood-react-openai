import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_USER_FAVORITES,
  CHECK_IF_FAVORITES,
} from "@/graphql/queries/users";
import { _get } from "@/utils";
import useAuth from "./useAuth";

const useUserFavorite = () => {
  const { user } = useAuth();
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
