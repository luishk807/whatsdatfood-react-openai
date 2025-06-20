import { type FC } from "react";
import { Grid } from "@mui/material";
import { MenuTitleInterface } from "interfaces";
import "./index.css";

const MenuTitle: FC<MenuTitleInterface> = ({ restaurant }) => {
  return (
    restaurant && (
      <Grid container size={12} display="flex" justifyContent="center">
        <Grid size={12} className="menu-results-main-section">
          <div className="menu-results-main-title">{restaurant.name}</div>
          <div className="menu-results-main-address">{restaurant.address}</div>
        </Grid>
      </Grid>
    )
  );
};

export default MenuTitle;
