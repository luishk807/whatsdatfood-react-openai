import { type FC } from "react";
import { Grid, Box } from "@mui/material";
import { convertCurrency } from "utils";
import Image from "components/Image";
import "./index.css";

export type MenuInterfaceItemType = {
  name: string;
  category: string;
  description: string;
  image: string;
  price: number;
};
export interface MenuItemInterface {
  item: MenuInterfaceItemType;
}
const MenuItem: FC<MenuItemInterface> = ({ item }) => {
  return (
    <Grid container className="item-menu-item-container">
      <Grid
        sx={{ display: { xs: "block", md: "none" } }}
        className="item-menu-item-title-mobile"
      >
        {item.name}
      </Grid>
      <Grid size={{ xs: 12, md: 2 }} className="item-menu-item-img">
        <Image alt={item.name} />
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
                {item.name}
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
            {item.description}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MenuItem;
