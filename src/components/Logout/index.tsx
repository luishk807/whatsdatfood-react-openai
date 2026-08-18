import { useEffect } from "react";
import Button from "@/components/Button";
import useAuth from "@/customHooks/useAuth";
import { CheckCircleIcon } from "@/components/icons";
import "./index.css";
import { Navigate, useNavigate } from "react-router-dom";
const Logout = () => {
  const navigator = useNavigate();
  const { logout, logoutQuery, user } = useAuth();
  const { loading } = logoutQuery;

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    if (user) {
      handleLogout();
    }
  }, []);

  if (loading) {
    return <h1>...loading</h1>;
  }

  return (
    <div id="logout-container">
      <div className="logout-item">
        <div>
          <CheckCircleIcon className="text-brand" />
        </div>
        You are successfully logged out!<p>Thank you!</p>
        <Button onClick={() => navigator("/")}>Back to Homepage</Button>
      </div>
    </div>
  );
};

export default Logout;
