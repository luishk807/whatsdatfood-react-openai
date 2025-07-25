import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/customHooks/useAuth";

const ProtectedRoute = () => {
  const { user, checkAuthQuery } = useAuth();
  const { loading, error, initialized } = checkAuthQuery;
  if (!initialized) {
    return <p>...loading</p>;
  }
  if (!user || error) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
