import { Link } from "react-router-dom";
import "./index.css";
import MenuIcon from "@mui/icons-material/Menu";
import { Grid, Box } from "@mui/material";
import { useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountButton from "../AccountButton";
import IconButton from "@mui/material/IconButton";
const Header = () => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu(!showMenu);

  const MenuLinks = () => {
    return (
      <ul className="header-list-ul">
        <li className="header-list-ul-li">
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <AccountButton />
          </Box>
        </li>
        <li className="header-list-ul-li">About</li>
        <li className="header-list-ul-li">Contact</li>
        <li className="header-list-ul-li">
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <Link to="/sign-in" className="link-text">
              Sign In
            </Link>
          </Box>
        </li>
        <li className="header-list-ul-li">
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <Link to="/create-account" className="link-text">
              Create Account
            </Link>
          </Box>
        </li>
      </ul>
    );
  };
  return (
    <>
      <Grid container id="header-container">
        <Grid className="header-logo" size={{ lg: 2, xs: 6 }}>
          <Link to="/">What's that food</Link>
        </Grid>
        <Grid
          size={{ lg: 10 }}
          sx={{
            display: {
              md: "flex",
              xs: "none",
            },
          }}
          className="header-list-menu"
        >
          <MenuLinks />
        </Grid>
        <Grid
          size={{ xs: 6 }}
          sx={{
            justifyContent: "end",
            display: {
              xs: "flex",
              md: "none",
            },
          }}
        >
          <IconButton onClick={toggleMenu}>
            <MenuIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Grid container className={`header-big-menu ${showMenu ? "active" : ""}`}>
        <Grid className="header-big-menu-icon">
          <IconButton onClick={toggleMenu} size="small">
            <CloseRoundedIcon sx={{ fontSize: "24px" }} />
          </IconButton>
        </Grid>
        <Grid className="header-big-menu-list">
          <MenuLinks />
        </Grid>
      </Grid>
    </>
  );
};

export default Header;
