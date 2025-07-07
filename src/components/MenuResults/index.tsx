import { useState, type FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid, Box, Skeleton } from "@mui/material";
import MenuItem from "@/components/MenuItem";
import { RestaurantType, MenuItemType, RestCategoryMenu } from "@/types";
import LoadingComponent from "../LoadingComponent";
import { getRestaurantBySlug } from "@/api/restaurants";
import MenuTitle from "@/components/MenuTitle";
import "./index.css";
import { _get } from "@/utils";
import { LOADING_TYPES } from "@/customConstants";
import SkeletonMenuItem from "../SkeletonLoaders/MenuResultPage";

const MenuResults: FC = () => {
  const { restaurant } = useParams();
  const [restaurantMenu, setRestaurantMenu] = useState<RestCategoryMenu>({});
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantType | null>(
    null,
  );
  const [showLoading, setShowLoading] = useState(true);

  const handleFetchRestaurant = async () => {
    setShowLoading(true);
    if (restaurant) {
      const resp: RestaurantType = await getRestaurantBySlug(
        String(restaurant),
      );
      const menuItems = _get<MenuItemType[]>(resp, "restRestaurantItems", []);

      setShowLoading(false);
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
        city: resp.city,
        state: resp.state,
        postal_code: resp.postal_code,
      });
    }
  };

  useEffect(() => {
    handleFetchRestaurant();
  }, [restaurant]);

  return (
    <Grid container>
      <LoadingComponent
        customLoader={SkeletonMenuItem}
        type={LOADING_TYPES.CUSTOM}
        data={restaurantInfo}
      >
        <MenuTitle restaurant={restaurantInfo} />
        <Grid size={12}>
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
        </Grid>
      </LoadingComponent>
    </Grid>
  );
};

export default MenuResults;
