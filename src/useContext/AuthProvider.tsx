import { ReactNode } from "react";
import { createContext } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CHECK_AUTH, LOGOUT_QUERY } from "@/graphql/queries/login";
import { useEffect, useState } from "react";
import { UserType } from "@/interfaces/users";

interface AuthProviderInterface {
  user: UserType | null;
  checkAuthQuery: {
    loading: boolean;
    error: any;
    initialized: boolean;
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
  const [initialized, setInitialized] = useState(false);
  const [checkAuth, { data, loading, error }] = useLazyQuery(CHECK_AUTH, {
    fetchPolicy: "network-only",
  });

  const [logoutMutation, { loading: logoutLoading }] =
    useMutation(LOGOUT_QUERY);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (data || error) {
      setInitialized(true);
    }

    if (data?.checkAuth) {
      setUser(data.checkAuth);
    } else {
      setUser(null);
    }
  }, [data, error]);

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
      initialized,
    },
    logoutQuery: {
      loading: logoutLoading,
    },
    checkUser: checkAuth,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
