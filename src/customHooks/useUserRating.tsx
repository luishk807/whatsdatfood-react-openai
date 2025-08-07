import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_USER_RATING,
  GET_RATINGS_BY_REST_ITEM_ID,
  GET_RATINGS_BY_USER,
} from "@/graphql/queries/users";
import { _get } from "@/utils";
import useAuth from "@/customHooks/useAuth";
import { UserRatingListResp } from "@/interfaces/users";
const useUserRating = () => {
  const { user } = useAuth();
  const [createRating, { loading: submitRatingLoading, error, data }] =
    useMutation(ADD_USER_RATING);

  const [
    getAllRatingByRestItemId,
    {
      loading: getUserRatingByRestItemIdLoading,
      error: getUserRatingByRestItemIdError,
      data: getUserRatingByRestItemIdData,
    },
  ] = useLazyQuery(GET_RATINGS_BY_REST_ITEM_ID, {
    fetchPolicy: "network-only",
  });

  const [
    getAllUserRatingByUser,
    {
      loading: getAllUserRatingByUserLoading,
      error: getAllUserRatingByUserError,
      data: getAllUserRatingByUserData,
    },
  ] = useLazyQuery(GET_RATINGS_BY_USER, {
    fetchPolicy: "network-only",
  });

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

  const getUserRatingsByUser = async (page: number, limit?: number) => {
    try {
      if (user) {
        const resp = await getAllUserRatingByUser({
          variables: {
            page,
            limit,
          },
        });

        return _get(resp, "data.getRatingsByUser");
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

  const getUserRatingsByItemId = async (
    restItemId: number,
    page: number,
    limit?: number,
  ): Promise<UserRatingListResp> => {
    try {
      if (user) {
        const resp = await getAllRatingByRestItemId({
          variables: {
            restItemId: restItemId,
            page: page,
            limit: limit,
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

  return {
    saveRating,
    getUserRatingsByUser,
    getUserRatingsByItemId,
    submitRatingQuery: {
      loading: submitRatingLoading,
      error: error,
      data: data,
    },
    getAllUserRatingByUserQuery: {
      loading: getAllUserRatingByUserLoading,
      error: getAllUserRatingByUserError,
      data: getAllUserRatingByUserData,
    },
    getAllRatingByRestItemIdQuery: {
      loading: getUserRatingByRestItemIdLoading,
      error: getUserRatingByRestItemIdError,
      data: getUserRatingByRestItemIdData,
    },
  };
};

export default useUserRating;
