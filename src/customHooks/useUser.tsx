import { useMutation } from "@apollo/client";
import { ADD_USER_RATING } from "@/graphql/queries/users";
import { _get } from "@/utils";
import useAuth from "./useAuth";
const useUser = () => {
  const { user } = useAuth();
  const [createRating, { loading: submitRatingLoading, error, data }] =
    useMutation(ADD_USER_RATING);

  const submitRating = async (payload: any) => {
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

        return _get(resp, "data.checkUsername");
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
  return {
    submitRating,
    submitRatingQuery: {
      loading: submitRatingLoading,
    },
  };
};

export default useUser;
