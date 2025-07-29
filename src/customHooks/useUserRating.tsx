import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_USER_RATING,
  GET_USER_RATING_BY_RESTAURANT_ID,
  GET_ALL_USER_RATING_BY_ITEM_ID,
} from "@/graphql/queries/users";
import { _get } from "@/utils";
import useAuth from "@/customHooks/useAuth";
import { UserRatingListResp } from "@/interfaces/users";
const useUserRating = () => {
  const { user } = useAuth();
  const [createRating, { loading: submitRatingLoading, error, data }] =
    useMutation(ADD_USER_RATING);

  const [
    getUserRatingByRestItemId,
    {
      loading: useRatingByRestItemIdLoading,
      error: useRatingByRestItemIdError,
      data: useRatingByRestItemIdData,
    },
  ] = useLazyQuery(GET_USER_RATING_BY_RESTAURANT_ID, {
    fetchPolicy: "network-only",
  });

  const [
    getAllUserRatingByRestItemId,
    {
      loading: useAllRatingByRestItemIdLoading,
      error: useAllRatingByRestItemIdError,
      data: useAllRatingByRestItemIdData,
    },
  ] = useLazyQuery(GET_ALL_USER_RATING_BY_ITEM_ID, {
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

  const getAllRatingsByItemId = async (
    restItemId: number,
    page: number,
    limit?: number,
  ): Promise<UserRatingListResp> => {
    try {
      if (user) {
        const resp = await getAllUserRatingByRestItemId({
          variables: {
            restItemId: restItemId,
            page: page,
            limit: limit,
          },
        });

        return _get(resp, "data.allRatingsByItemId");
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
    getUserRatingByItemId,
    getAllRatingsByItemId,
    submitRatingQuery: {
      loading: submitRatingLoading,
      error: error,
      data: data,
    },
    allUserRatingByRestItemIdQuery: {
      loading: useAllRatingByRestItemIdLoading,
      error: useAllRatingByRestItemIdError,
      data: useAllRatingByRestItemIdData,
    },
    userRatingByRestItemIdQuery: {
      loading: useRatingByRestItemIdLoading,
      error: useRatingByRestItemIdError,
      data: useRatingByRestItemIdData,
    },
  };
};

export default useUserRating;
