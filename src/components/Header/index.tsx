import "./index.css";
import { Grid } from "@mui/material";
const Header = () => {
  return (
    <Grid container id="header-container">
      <Grid className="header-logo">What's that food</Grid>
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
