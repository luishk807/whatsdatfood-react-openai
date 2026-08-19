import { useMutation } from "@apollo/client";
import { LOGIN_QUERY } from "@/graphql/queries/login";
import { _get } from "@/utils";

const useLogin = () => {
  const [loginMutation, { data, loading, error }] = useMutation(LOGIN_QUERY);
  const login = async (username: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          username,
          password,
        },
        context: {
          credentials: "include",
        },
      });

      // The payload, not the payload's truthiness. `{ success: false }` is an
      // object, so a caller writing `if (await login(...))` was signing
      // somebody in on a refusal — survivable only because the backend raises
      // instead of returning one.
      return Boolean(_get(data, "login.success", false));
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("ERROR: can't login");
    }
  };

  return { login, data, loading, error };
};

export default useLogin;
