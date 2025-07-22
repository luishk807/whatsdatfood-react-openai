import { type FC } from "react";
import { Grid, Box } from "@mui/material";
import { MenuTitleInterface } from "@/interfaces";
import "./index.css";
import { getBuiltAddress, _get } from "@/utils";
import MichelinStars from "@/components/MichelinStars";
import Rating from "@/components/Rating";
const MenuTitle: FC<MenuTitleInterface> = ({ restaurant }) => {
  console.log("fff", restaurant);
  const addressFull = restaurant
    ? getBuiltAddress({
        address: _get(restaurant, "address"),
        city: _get(restaurant, "city"),
        state: _get(restaurant, "state"),
        country: _get(restaurant, "country"),
        postal_code: _get(restaurant, "postal_code"),
      })
    : null;

  if (!restaurant) {
    return;
  }

  return (
    <Grid
      container
      width="100%"
      size={12}
      display="flex"
      justifyContent="center"
    >
      <Grid size={12} className="menu-results-main-section">
        <div className="menu-results-main-title flex justify-center item-center">
          {restaurant?.name || "Restaurant name unavailable"}

          <Rating
            oneStarMode={true}
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: ".5em",
              paddingLeft: "5px",
            }}
            defaultValue={Number(restaurant?.rating)}
          />
        </div>
        <Box sx={{ fontSize: "1.3em" }}>{restaurant?.phone}</Box>
        <div className="menu-results-main-address">
          {addressFull || "Address unavailable"}
        </div>
        <div>
          <MichelinStars stars={restaurant?.michelin_score} />
        </div>
      </Grid>
    </Grid>
  );
};

export default MenuTitle;
