import { Grid } from "@mui/material";
import { isHomePage } from "@/utils";
import "./index.css";
import { clsx } from "clsx";
const Footer = () => {
  const isHomepage = isHomePage();
  return (
    <Grid
      container
      id="footer-container"
      className={clsx({
        "footer-subpage": !isHomepage,
      })}
    >
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
