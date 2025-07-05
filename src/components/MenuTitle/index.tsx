import { type FC } from "react";
import { Grid } from "@mui/material";
import { MenuTitleInterface } from "@/interfaces";
import LoadingComponent from "../LoadingComponent";
import "./index.css";
import { RestaurantType } from "@/types";
import { LOADING_TYPES } from "@/customConstants";

const MenuTitle: FC<MenuTitleInterface> = ({ restaurant }) => {
  return (
    <LoadingComponent<RestaurantType>
      data={restaurant}
      type={LOADING_TYPES.LINEAR}
    >
      <Grid
        container
        width="100%"
        size={12}
        display="flex"
        justifyContent="center"
      >
        <Grid size={12} className="menu-results-main-section">
          <div className="menu-results-main-title">{restaurant?.name}</div>
          <div className="menu-results-main-address">{restaurant?.address}</div>
        </Grid>
      </Grid>
    </LoadingComponent>
  );
};

export default MenuTitle;
