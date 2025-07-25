import { type FC } from "react";
import { Grid, Box } from "@mui/material";
import { MenuTitleInterface } from "@/interfaces/restaurants";
import "./index.css";
import { getBuiltAddress, _get } from "@/utils";
import MichelinStars from "@/components/MichelinStars";
import Rating from "@/components/Rating";
import BusinessHourDisplay from "../BusinessHoursDisplay";
import ShowRestaurantDetail from "@/components/ShowRestaurantDetail";

import RestaurantIconMenu from "../RestaurantIconMenu";
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
      id="menu-results-container"
      width="100%"
      size={12}
      display="flex"
      justifyContent="center"
    >
      <Grid size={12} className="menu-results-main-section">
        <Box
          component="div"
          sx={{
            flexDirection: {
              xs: "column",
              lg: "row",
            },
          }}
          className="menu-results-main-title flex justify-center item-center"
        >
          {restaurant?.name || "Restaurant name unavailable"}

          <Rating
            oneStarMode={true}
            sx={{
              display: {
                xs: "block",
                lg: "flex",
              },
              alignItems: "center",
              fontSize: ".5em",
              paddingLeft: "5px",
            }}
            defaultValue={Number(restaurant?.rating)}
          />
        </Box>
        <Box sx={{ fontSize: "1.3em" }}>{restaurant?.phone}</Box>
        <div className="menu-results-main-address">
          {addressFull || "Address unavailable"}
        </div>
        <div>
          <MichelinStars stars={restaurant?.michelin_score} />
        </div>
      </Grid>
      <Grid size={12}>
        <Box
          sx={{
            display: {
              lg: "flex",
              xs: "none",
            },
            justifyContent: {
              lg: "center",
            },
            borderBottom: {
              xs: "1px solid white",
            },
          }}
        >
          <RestaurantIconMenu restaurant={restaurant} />
        </Box>
      </Grid>
      <Grid
        size={12}
        sx={{ margin: "10px 0px" }}
        className="flex justify-center"
      >
        Price Range: {restaurant.price_range}
      </Grid>
      <Grid size={12} className="flex justify-center">
        {restaurant.description}
      </Grid>
      <Grid size={12} className="flex justify-center">
        <Grid container className="menu-result-info-container">
          <Grid size={12} className="menu-result-info-title">
            Payment Method
          </Grid>
          <Grid
            size={12}
            className="menu-result-info-data"
            sx={{ textTransform: "capitalize" }}
          >
            {restaurant.payment_method || "N/A"}
          </Grid>
        </Grid>
      </Grid>
      <Grid size={12} className="flex justify-center">
        <BusinessHourDisplay schedules={restaurant.businessHours} />
      </Grid>
      <Grid size={12}>
        <ShowRestaurantDetail data={restaurant} />
      </Grid>
    </Grid>
  );
};

export default MenuTitle;
