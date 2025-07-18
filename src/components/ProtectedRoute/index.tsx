import { Navigate, Outlet } from "react-router-dom";
import { CHECK_AUTH } from "@/graphql/queries/login";
import { useQuery } from "@apollo/client";

const ProtectedRoute = () => {
  const { data, loading, error } = useQuery(CHECK_AUTH, {
    fetchPolicy: "network-only",
  });

  if (loading) {
    return <p>...loading</p>;
  }

  if (error || !data?.checkAuth) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
