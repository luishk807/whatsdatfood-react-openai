import { useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { CHECK_AUTH } from "@/graphql/queries/login";
import { _get } from "@/utils";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const navigate = useNavigate();
  const [checkAuth, { data, loading, error }] = useLazyQuery(CHECK_AUTH, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (data?.checkAuth) {
      console.log("user is logged in", data.checkAuth);
    } else {
      console.log("not logged in");
      navigate("/");
    }
  }, [data, loading]);

  return null;
};
export default useAuth;
