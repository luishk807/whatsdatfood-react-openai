import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/customHooks/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <p>...loading</p>;
  }
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
