import { type FC } from "react";
import { Grid } from "@mui/material";
import { MenuTitleInterface } from "@/interfaces";
import "./index.css";
import { getBuiltAddress, _get } from "@/utils";

const MenuTitle: FC<MenuTitleInterface> = ({ restaurant }) => {
  const addressFull = restaurant
    ? getBuiltAddress({
        address: _get(restaurant, "address"),
        city: _get(restaurant, "city"),
        state: _get(restaurant, "state"),
        country: _get(restaurant, "country"),
        postal_code: _get(restaurant, "postal_code"),
      })
    : null;
  return (
    <Grid
      container
      width="100%"
      size={12}
      display="flex"
      justifyContent="center"
    >
      <Grid size={12} className="menu-results-main-section">
        <div className="menu-results-main-title">
          {restaurant?.name || "Restaurant name unavailable"}
        </div>
        <div className="menu-results-main-address">
          {addressFull || "Address unavailable"}
        </div>
      </Grid>
    </Grid>
  );
};

export default MenuTitle;
