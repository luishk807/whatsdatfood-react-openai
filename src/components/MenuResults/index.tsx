import { useState, type FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import MenuItem from "@/components/MenuItem";
import {
  RestaurantType,
  MenuItemType,
  RestCategoryMenu,
  MenuInterfaceItemType,
} from "@/types";
import LoadingComponent from "../LoadingComponent";
import { getRestaurantBySlug } from "@/api/restaurants";
import MenuTitle from "@/components/MenuTitle";
import "./index.css";
import { _get } from "@/utils";
import { LOADING_TYPES } from "@/customConstants";

const MenuResults: FC = () => {
  const { restaurant } = useParams();
  const [restaurantMenu, setRestaurantMenu] = useState<RestCategoryMenu>({});
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantType | null>(
    null,
  );

  const handleFetchRestaurant = async () => {
    if (restaurant) {
      const resp: RestaurantType = await getRestaurantBySlug(
        String(restaurant),
      );
      const menuItems = _get<MenuItemType[]>(resp, "restRestaurantItems", []);

      console.log(menuItems);

      if (menuItems && menuItems.length) {
        const map = new Map<string, MenuItemType[]>();

        menuItems.forEach((item) => {
          if (!map.has(item.category)) {
            map.set(item.category, [item]);
          } else {
            map.set(item.category, [...map.get(item.category)!, item]);
          }
        });

        const newMenu = Object.fromEntries(map);
        setRestaurantMenu(newMenu);
      }

      setRestaurantInfo({
        name: resp.name,
        address: resp.address,
      });
    }
  };

  useEffect(() => {
    handleFetchRestaurant();
  }, [restaurant]);

  return (
    <Grid container>
      <MenuTitle restaurant={restaurantInfo} />
      <Grid size={12}>
        <LoadingComponent<RestCategoryMenu>
          type={LOADING_TYPES.CIRCULAR}
          data={restaurantMenu}
        >
          {Object.keys(restaurantMenu).map((category, catIndx) => {
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
                  {restaurantMenu[category].map((item: any, indx: number) => (
                    <MenuItem key={indx} item={item} />
                  ))}
                </Grid>
              </Grid>
            );
          })}
        </LoadingComponent>
      </Grid>
    </Grid>
  );
};

export default MenuResults;
