import { ReactNode } from "react";
import { createContext } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CHECK_AUTH, LOGOUT_QUERY } from "@/graphql/queries/login";
import { useEffect, useState } from "react";
import { UserType } from "@/types/users";

interface AuthProviderInterface {
  user: UserType | null;
  loading: boolean;
  error: any;
  logout: () => void;
  checkUser: () => void;
}
export const AuthContext = createContext<AuthProviderInterface | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [checkAuth, { data, loading, error }] = useLazyQuery(CHECK_AUTH, {
    fetchPolicy: "network-only",
  });

  const [logoutMutation] = useMutation(LOGOUT_QUERY);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    console.log("data", data);
    if (data?.checkAuth) {
      setUser(data.checkAuth);
    } else {
      setUser(null);
    }
  }, [data]);

  const logout = async () => {
    await logoutMutation();
    setUser(null);
  };

  const value = {
    user,
    logout,
    error,
    loading,
    checkUser: checkAuth,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
