import { useEffect } from "react";
import { Grid, Box } from "@mui/material";
import Button from "@/components/Button";
import useAuth from "@/customHooks/useAuth";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
    <Grid container id="logout-container">
      <Grid className="logout-item">
        <Box>
          <CheckCircleOutlineIcon sx={{ fill: "green" }} />
        </Box>
        Your are succesfully logout!<p>Thank you!</p>
        <Button onClick={() => navigator("/")}>Back to Homepage</Button>
      </Grid>
    </Grid>
  );
};

export default Logout;
