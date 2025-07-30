import { useMutation } from "@apollo/client";
import {
  ADD_USER_MUTATION,
  UPDATE_USER_MUTATION,
} from "@/graphql/queries/users";
import { _get } from "@/utils";
import useAuth from "./useAuth";

const useUser = () => {
  const { user } = useAuth();
  const [
    createUserGraphql,
    {
      loading: createUserLoading,
      error: createUserError,
      data: createUserData,
    },
  ] = useMutation(ADD_USER_MUTATION);

  const [
    updateUserGraphql,
    {
      loading: updateUserLoading,
      error: updateUserError,
      data: updateUserData,
    },
  ] = useMutation(UPDATE_USER_MUTATION);

  const createUser = async (payload: any) => {
    try {
      const resp = await createUserGraphql({
        variables: {
          payload: payload,
        },
      });

      return _get(resp, "data.addUser");
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

  return {
    createUser,
    updateUser,
    updateUserQuery: {
      loading: updateUserLoading,
      error: updateUserError,
      data: updateUserData,
    },
    submitUserQuery: {
      loading: createUserLoading,
      error: createUserError,
      data: createUserData,
    },
  };
};

export default useUser;
