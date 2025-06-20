import { Link } from "react-router-dom";
import "./index.css";
import { Grid } from "@mui/material";
const Header = () => {
  return (
    <Grid container id="header-container">
      <Grid className="header-logo">
        <Link to="/">What's that food</Link>
      </Grid>
      <Grid className="header-list-menu">
        <ul className="header-list-ul">
          <li className="header-list-ul-li">About</li>
          <li className="header-list-ul-li">Contact</li>
        </ul>
      </Grid>
    </Grid>
  );
};

export default Header;
