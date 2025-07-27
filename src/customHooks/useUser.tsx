import { useMutation } from "@apollo/client";
import {
  ADD_USER_RATING,
  ADD_USER_MUTATION,
  ADD_USER_FAVORITES,
  UPDATE_USER_MUTATION,
} from "@/graphql/queries/users";
import { _get } from "@/utils";
import useAuth from "./useAuth";

const useUser = () => {
  const { user } = useAuth();
  const [createRating, { loading: submitRatingLoading, error, data }] =
    useMutation(ADD_USER_RATING);
  const [
    createUserGraphql,
    {
      loading: createUserLoading,
      error: createUserError,
      data: createUserData,
    },
  ] = useMutation(ADD_USER_MUTATION);
  const [
    createUserFavorites,
    {
      loading: createUserFavoritesLoading,
      error: createUserFavoritesError,
      data: createUserFavoritesData,
    },
  ] = useMutation(ADD_USER_FAVORITES);

  const [
    updateUserGraphql,
    {
      loading: updateUserLoading,
      error: updateUserError,
      data: updateUserData,
    },
  ] = useMutation(UPDATE_USER_MUTATION);

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
  const createUser = async (payload: any) => {
    try {
      if (user) {
        const resp = await createUserGraphql({
          variables: {
            payload: payload,
          },
        });

        return _get(resp, "data.updateUser");
      } else {
        throw new Error("ERROR: unable to save user");
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("ERROR: unable to save user");
    }
  };
  const updateUser = async (payload: any) => {
    try {
      if (user) {
        const resp = await updateUserGraphql({
          variables: {
            payload: payload,
          },
        });

        return _get(resp, "data.addUser");
      } else {
        throw new Error("ERROR: unable to create user");
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("ERROR: unable to crate user");
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
    createUser,
    saveFavorites,
    updateUser,
    updateUserQuery: {
      loading: updateUserLoading,
      error: updateUserError,
      data: updateUserData,
    },
    submitRatingQuery: {
      loading: submitRatingLoading,
      error: error,
      data: data,
    },
    submitUserQuery: {
      loading: createUserLoading,
      error: createUserError,
      data: createUserData,
    },
    submitUserFavoritesQuery: {
      loading: createUserFavoritesLoading,
      error: createUserFavoritesError,
      data: createUserFavoritesData,
    },
  };
};

export default useUser;
