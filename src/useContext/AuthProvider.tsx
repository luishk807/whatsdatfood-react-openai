import { ReactNode } from "react";
import { createContext } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CHECK_AUTH, LOGOUT_QUERY } from "@/graphql/queries/login";
import { useCallback, useEffect, useState } from "react";
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

  /**
   * Ask who is signed in, and record the answer from the answer.
   *
   * This used to run the query and let a `useEffect` on `data` set the user,
   * which made signing in look like it had failed: the account was created,
   * the cookie was set, and the header still offered "Sign in" until the page
   * was reloaded. An effect keyed on a query result fires only when that
   * result changes identity, so the state the whole app reads depended on a
   * re-render happening - and the caller had already navigated away.
   *
   * Reading the resolved value is both simpler and immediate: `checkUser()`
   * returns having already set the user, so the sign-in page can navigate the
   * moment it resolves and the header is right when it arrives.
   */
  const refresh = useCallback(async (): Promise<UserType | null> => {
    try {
      const result = await checkAuth();
      const found = (result?.data?.checkAuth as UserType | null) ?? null;

      setUser(found);

      return found;
    } catch {
      // Not signed in is the ordinary answer here, not a failure.
      setUser(null);

      return null;
    } finally {
      // Set either way: "we have asked" is a different fact from "somebody is
      // signed in", and the guards on protected routes need the first one.
      setInitialized(true);
    }
  }, [checkAuth]);

  useEffect(() => {
    refresh();
    // Once, on mount. `refresh` is stable, but depending on it here would be
    // one identity change away from asking on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    checkUser: refresh,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
