import { _get } from "@/utils";
import { userRatingPayload, CreateUserInputType } from "@/types/users";
import { ADD_USER_MUTATION, ADD_USER_RATING } from "@/graphql/queries/users";
import { useMutation } from "@apollo/client";

export const handleCreateUser = async (
  payload: CreateUserInputType,
): Promise<CreateUserInputType> => {
  try {
    const [addUser] = useMutation(ADD_USER_MUTATION);
    const { data } = await addUser({
      variables: {
        payload,
      },
    });

    const resp = _get(data, "addUser");

    console.log("handleCreateUser", resp);

    return resp as unknown as CreateUserInputType;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("ERROR: unable to create user");
  }
};
export const addUserRating = async (
  payload: userRatingPayload,
): Promise<userRatingPayload> => {
  try {
    const [addUserRating] = useMutation(ADD_USER_RATING);
    const { data } = await addUserRating({
      variables: {
        payload,
      },
    });

    const resp = _get(data, "addUserRating");

    console.log("addUserRating", resp);

    return resp as unknown as userRatingPayload;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }

    throw new Error("ERROR: unable to create rating");
  }
};
