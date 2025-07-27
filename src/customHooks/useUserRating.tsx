import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_USER_RATING,
  ADD_USER_FAVORITES,
  GET_USER_RATING_BY_RESTAURANT_ID,
} from "@/graphql/queries/users";
import { _get } from "@/utils";
import useAuth from "./useAuth";

const useUserRating = () => {
  const { user } = useAuth();
  const [createRating, { loading: submitRatingLoading, error, data }] =
    useMutation(ADD_USER_RATING);
  const [
    createUserFavorites,
    {
      loading: createUserFavoritesLoading,
      error: createUserFavoritesError,
      data: createUserFavoritesData,
    },
  ] = useMutation(ADD_USER_FAVORITES);

  const [
    getUserRatingByRestItemId,
    {
      loading: useRatingByRestItemIdLoading,
      error: useRatingByRestItemIdError,
      data: useRatingByRestItemIdData,
    },
  ] = useLazyQuery(GET_USER_RATING_BY_RESTAURANT_ID);

  const saveRating = async (payload: any) => {
    try {
      if (user) {
        const new_payload = {
          ...payload,
          user_id: user.id,
          rating: parseFloat(payload.rating),
        };

        const resp = await createRating({
          variables: {
            payload: new_payload,
          },
        });

        return _get(resp, "data.addUserRating");
      } else {
        throw new Error("ERROR: unable to save rating");
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("ERROR: unable to save rating");
    }
  };

  const getUserRatingByItemId = async (restItemId: number) => {
    try {
      if (user) {
        const resp = await getUserRatingByRestItemId({
          variables: {
            restItemId: restItemId,
          },
        });

        return _get(resp, "data.getRatingByRestItemId");
      } else {
        throw new Error("ERROR: unable to get rating");
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("ERROR: unable to get rating");
    }
  };

  const saveFavorites = async (payload: any) => {
    try {
      if (user) {
        const resp = await createUserFavorites({
          variables: {
            payload: payload,
          },
        });

        return _get(resp, "data.addUserFavorites");
      } else {
        throw new Error("ERROR: unable to save user favorites");
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("ERROR: unable to save user favorites");
    }
  };
  return {
    saveRating,
    saveFavorites,
    getUserRatingByItemId,
    submitRatingQuery: {
      loading: submitRatingLoading,
      error: error,
      data: data,
    },
    submitUserFavoritesQuery: {
      loading: createUserFavoritesLoading,
      error: createUserFavoritesError,
      data: createUserFavoritesData,
    },
    userRatingByRestItemIdQuery: {
      loading: useRatingByRestItemIdLoading,
      error: useRatingByRestItemIdError,
      data: useRatingByRestItemIdData,
    },
  };
};

export default useUserRating;
