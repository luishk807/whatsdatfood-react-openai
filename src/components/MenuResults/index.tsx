import { useState, useMemo, type FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import SamplerResults from "samples/menu-item.json";
import MenuItem from "components/MenuItem";
import { RestaurantType } from "types";
import { getRestaurantBySlug } from "api/restaurants";
import MenuTitle from "../MenuTitle";
import "./index.css";

const MenuResults: FC = () => {
  const { restaurant } = useParams();
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantType | null>(
    null,
  );
  console.log(SamplerResults);

  console.log("result", restaurant);

  const map = new Map();

  SamplerResults.menu.forEach((item) => {
    if (!map.has(item.category)) {
      map.set(item.category, [item]);
    } else {
      const values = map.get(item.category);
      values.push(item);
      map.set(item.category, values);
    }
  });

  const newMenu = Object.fromEntries(map);

  console.log(newMenu);

  const handleFetchRestaurant = async () => {
    if (restaurant) {
      const resp: RestaurantType = await getRestaurantBySlug(
        String(restaurant),
      );
      setRestaurantInfo(resp);
    }
  };

  useEffect(() => {
    handleFetchRestaurant();
  }, [restaurant]);

  return (
    <Grid container>
      <MenuTitle restaurant={restaurantInfo} />
      <Grid size={12}>
        {Object.keys(newMenu).map((category, catIndx) => {
          return (
            <Grid
              key={catIndx}
              container
              className="menu-result-category-container"
            >
              <Grid size={12} className="menu-result-category-title">
                {category}
              </Grid>
              <Grid size={12}>
                {newMenu[category].map((item: any, indx: number) => (
                  <MenuItem key={indx} item={item} />
                ))}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
};

export default MenuResults;
