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

      const resp = _get(data, "login");

      return resp;
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
