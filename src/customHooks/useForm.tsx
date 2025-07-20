import { CHECK_USERNAME_EXIST } from "@/graphql/queries/users";
import { _get } from "@/utils";
import { useLazyQuery } from "@apollo/client";

const useFormHook = () => {
  const [checkUsername, { data, loading, error }] = useLazyQuery(
    CHECK_USERNAME_EXIST,
    {
      fetchPolicy: "network-only",
    },
  );

  const checkValidUsername = async (username: string): Promise<boolean> => {
    try {
      const resp = await checkUsername({
        variables: {
          username,
        },
      });

      return !!_get(resp, "data.checkUsername");
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      return false;
    }
  };

  return {
    checkValidUsername,
    usernameLoading: loading,
    usernameError: error,
  };
};

export default useFormHook;
