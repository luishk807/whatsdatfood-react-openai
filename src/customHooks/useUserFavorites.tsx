import { useLazyQuery, useMutation } from "@apollo/client";
import { ADD_USER_FAVORITES } from "@/graphql/queries/users";
import { _get } from "@/utils";
import useAuth from "./useAuth";

const useUserRating = () => {
  const { user } = useAuth();
  const [
    createUserFavorites,
    {
      loading: createUserFavoritesLoading,
      error: createUserFavoritesError,
      data: createUserFavoritesData,
    },
  ] = useMutation(ADD_USER_FAVORITES);

  const saveFavorites = async (slug: string) => {
    try {
      if (!slug) {
        console.error("❌ Invalid slug passed to saveFavorites:", slug);
        throw new Error("Slug is required");
      }

      const resp = await createUserFavorites({
        variables: {
          input: {
            slug: "peter-luger-steak-house-178-broadway-brooklyn-ny-11211-usa",
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
  return {
    saveFavorites,
    submitUserFavoritesQuery: {
      loading: createUserFavoritesLoading,
      error: createUserFavoritesError,
      data: createUserFavoritesData,
    },
  };
};

export default useUserRating;
