import { ReactNode } from "react";
import { createContext } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CHECK_AUTH, LOGOUT_QUERY } from "@/graphql/queries/login";
import { useEffect, useState } from "react";
import { UserType } from "@/types/users";

interface AuthProviderInterface {
  user: UserType | null;
  checkAuthQuery: {
    loading: boolean;
    error: any;
  };
  logoutQuery: {
    loading: boolean;
  };
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

  const [logoutMutation, { loading: logoutLoading }] =
    useMutation(LOGOUT_QUERY);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
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
    checkAuthQuery: {
      loading,
      error,
    },
    logoutQuery: {
      loading: logoutLoading,
    },
    checkUser: checkAuth,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
