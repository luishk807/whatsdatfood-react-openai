import { useState, type FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid, Box, Skeleton } from "@mui/material";
import MenuItem from "@/components/MenuItem";
import {
  RestaurantType,
  MenuItemType,
  RestCategoryMenu,
} from "@/types/restaurants";
import LoadingComponent from "../LoadingComponent";
import MenuTitle from "@/components/MenuTitle";
import "./index.css";
import { _get } from "@/utils";
import { LOADING_TYPES } from "@/customConstants";
import SkeletonMenuItem from "../SkeletonLoaders/MenuResultPage";
import useRestaurantMutation from "@/customHooks/useRestaurantMutations";

const MenuResults: FC = () => {
  const { getRestaurantListBySlug, getRestaurantListBySlugQuery } =
    useRestaurantMutation();
  const { loading } = getRestaurantListBySlugQuery;
  const { restaurant } = useParams();
  const [restaurantMenu, setRestaurantMenu] = useState<RestCategoryMenu>({});
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantType | null>(
    null,
  );

  const handleFetchRestaurant = async () => {
    if (restaurant) {
      const resp = await getRestaurantListBySlug(restaurant);

      if (resp) {
        const menuItems = _get<MenuItemType[]>(resp, "restaurantItems", []);

        if (menuItems && menuItems.length) {
          const map = new Map<string, MenuItemType[]>();

          menuItems.forEach((item) => {
            if (item) {
              if (!map.has(item.category)) {
                map.set(item.category, [item]);
              } else {
                map.set(item.category, [...map.get(item.category)!, item]);
              }
            }
          });

          const newMenu = Object.fromEntries(map);
          setRestaurantMenu(newMenu);
        }

        setRestaurantInfo({
          name: _get(resp, "name"),
          address: _get(resp, "address"),
          city: _get(resp, "city"),
          state: _get(resp, "state"),
          postal_code: _get(resp, "postal_code"),
          michelin_score: _get(resp, "michelin_score"),
          rating: Number(_get(resp, "rating", 0)),
          phone: _get(resp, "phone"),
          letter_grade: _get(resp, "letter_grade"),
          description: _get(resp, "description"),
        });
      }
    }
  };

  useEffect(() => {
    handleFetchRestaurant();
  }, [restaurant]);

  return (
    <Grid container className="w-full">
      <LoadingComponent
        showLoading={loading}
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
                    <MenuItem
                      key={indx}
                      item={item}
                      restaurant={restaurantInfo}
                    />
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
