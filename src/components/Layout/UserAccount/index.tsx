import { useEffect, useState, type FC } from "react";
import { Grid, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { UserAccountLayoutInterface, UserType } from "@/interfaces/users";
import { ACCOUNT_MENU_LIST, LOGOUT_MENU } from "@/customConstants/index";
import useAuth from "@/customHooks/useAuth";
import "./index.css";

const UserAccountLayout: FC<UserAccountLayoutInterface> = ({
  children,
  sectionTitle,
}) => {
  const [userData, setUserData] = useState<UserType>();

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  return (
    <Grid container spacing={2} id="user-account-layout">
      <Grid
        size={{
          md: 12,
          lg: 8,
          sm: 12,
        }}
      >
        <Grid container>
          {userData && (
            <Grid size={12} className="user-account-layout-header">
              <h1>
                Hi {userData?.first_name} {user?.last_name}
              </h1>
            </Grid>
          )}
          <Grid
            size={{
              md: 3,
              lg: 3,
            }}
            sx={{
              display: {
                xs: "none",
                sm: "none",
                md: "block",
                lg: "block",
              },
            }}
            className="user-account-layout-dropdown"
          >
            <ul>
              {ACCOUNT_MENU_LIST.map((item, indx) => (
                <li key={indx}>
                  <Link to={item.url}>{item.name}</Link>
                </li>
              ))}
            </ul>
            <Grid size={12} className="user-account-logout line-separator-top">
              <Link to={LOGOUT_MENU.url}>{LOGOUT_MENU.name}</Link>
            </Grid>
          </Grid>

          <Grid
            size={{
              md: 10,
              lg: 8,
              sm: 12,
            }}
            className="user-account-layout-content"
          >
            <Box
              sx={{
                padding: {
                  lg: "10px",
                },
                width: {
                  lg: "80%",
                  md: "80%",
                  sm: "100%",
                  xs: "100%",
                },
              }}
              className="user-account-layout-content-inner"
            >
              <Grid container className="user-account-layout-content-sections">
                <Grid size={12} className="flex justify-start">
                  <h2>{sectionTitle}</h2>
                </Grid>
                <Grid size={12} className="flex justify-center">
                  {children}
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default UserAccountLayout;
