import { type FC } from "react";
import { Grid } from "@mui/material";
import { _get } from "@/utils";
import { convertCurrency } from "@/utils";
import { MenuItemInterface } from "@/interfaces";
import "./index.css";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import MenuItemImage from "@/components/MenuItemImage";
import { MenuInterfaceItemType } from "@/types";

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
                {item.name} {item.top_choice && <StarRoundedIcon />}
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
