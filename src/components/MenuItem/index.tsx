import { type FC } from "react";
import { Button, Grid } from "@mui/material";
import { _get } from "@/utils";
import { convertCurrency } from "@/utils";
import { MenuItemInterface } from "@/interfaces";
import { MenuInterfaceItemType } from "@/types";
import MenuItemImage from "@/components/MenuItemImage";
import MenuItemTitle from "@/components/MenuItemTitle";
import "./index.css";

const MenuItem: FC<MenuItemInterface> = ({ item }) => {
  return (
    <Grid container className="item-menu-item-container">
      <Grid
        sx={{ display: { xs: "block", md: "none" } }}
        className="item-menu-item-title-mobile"
      >
        <MenuItemTitle name={item.name} top_choice={item.top_choice} />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }} className="item-menu-item-img">
        <MenuItemImage<MenuInterfaceItemType> data={item} />
      </Grid>

      <Grid size={{ xs: 12, md: 10 }}>
        <Grid container>
          <Grid size={12}>
            <Grid container>
              <Grid
                sx={{ display: { xs: "none", md: "block" } }}
                size={10}
                className="item-menu-item-title"
              >
                <MenuItemTitle name={item.name} top_choice={item.top_choice} />
              </Grid>

              <Grid
                size={{ xs: 12, md: 2 }}
                display="flex"
                justifyContent={{ xs: "center", md: "end" }}
                className="item-menu-item-price"
              >
                {convertCurrency(item.price)}
              </Grid>
            </Grid>
          </Grid>

          <Grid size={12} className="item-menu-item-description">
            <Grid container className="w-full">
              <Grid size={{ lg: 10, xs: 12 }} className="flex justify-start">
                {item.description}
              </Grid>
              <Grid
                size={{ lg: 2, xs: 12 }}
                className="flex justify-end flex-col"
              >
                <Button variant="outlined" className="item-menu-item-btn">
                  Add to cart
                </Button>
                <Button variant="outlined" className="item-menu-item-btn">
                  Send to friend
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MenuItem;
