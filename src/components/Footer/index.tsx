import { Grid } from "@mui/material";
import "./index.css";
const Footer = () => {
  return (
    <Grid container id="footer-container">
      <Grid size={12} className="footer-list-container">
        <ul className="footer-ul-list">
          <li className="footer-ul-li">Footer</li>
          <li className="footer-ul-li">Contact</li>
        </ul>
      </Grid>
    </Grid>
  );
};

export default Footer;
