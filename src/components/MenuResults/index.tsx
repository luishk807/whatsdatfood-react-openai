import { useState, type FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid, Box, Skeleton } from "@mui/material";
import MenuItem from "@/components/MenuItem";
import {
  RestaurantType,
  MenuItemType,
  RestCategoryMenu,
} from "@/interfaces/restaurants";
import { CustomKeyPairObj } from "@/interfaces";
import LoadingComponent from "@/components/LoadingComponent";
import MenuTitle from "@/components/MenuTitle";
import "./index.css";
import Loading from "@/components/Loading";
import { _get, convertCurrency } from "@/utils";
import { LOADING_TYPES } from "@/customConstants";
import SkeletonMenuItem from "@/components/SkeletonLoaders/MenuResultPage";
import useRestaurantMutation from "@/customHooks/useRestaurantMutations";
import DashingDisplayBox from "@/components/DashingDisplayBox";
import useAuth from "@/customHooks/useAuth";
const MenuResults: FC = () => {
  const { getRestaurantListBySlug, getRestaurantListBySlugQuery } =
    useRestaurantMutation();
  const { loading } = getRestaurantListBySlugQuery;
  const { restaurant } = useParams();
  const [restaurantMenu, setRestaurantMenu] = useState<RestCategoryMenu>({});
  const [tastingMenuData, setTastingMenuData] = useState<
    CustomKeyPairObj<string>[] | null
  >(null);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantType | null>(
    null,
  );

  const { checkAuthQuery } = useAuth();
  const { initialized } = checkAuthQuery;
  const handleFetchRestaurant = async () => {
    if (restaurant) {
      const resp = await getRestaurantListBySlug(restaurant);

      if (resp) {
        const menuItems = _get<MenuItemType[]>(resp, "restaurantMenuItems", []);

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

        if (resp instanceof Object && Object.keys(resp).length) {
          const tastingMenu = _get(resp, "tasting_menu_only");
          const drinkingPrice = _get(resp, "drink_pairing_price");
          const tastingPrice = _get(resp, "tasting_menu_price");

          if (tastingMenu) {
            setTastingMenuData([
              {
                label: "Drinking Pairing Price",
                value: String(convertCurrency(Number(drinkingPrice))),
              },
              {
                label: "Tasting Menu Price",
                value: String(convertCurrency(Number(tastingPrice))),
              },
            ]);
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
            payment_method: _get(resp, "payment_method"),
            delivery_method: _get(resp, "delivery_method"),
            letter_grade: _get(resp, "letter_grade"),
            description: _get(resp, "description"),
            businessHours: _get(resp, "businessHours"),
            tasting_menu_only: _get(resp, "tasting_menu_only"),
            tasting_menu_price: _get(resp, "tasting_menu_price"),
            price_range: _get(resp, "price_range"),
            drink_pairing_price: _get(resp, "drink_pairing_price"),
            reservation_required: _get(resp, "reservation_required"),
            reservation_available: _get(resp, "reservation_available"),
            website: _get(resp, "website"),
            email: _get(resp, "email"),
          });
        }
      }
    }
  };

  useEffect(() => {
    handleFetchRestaurant();
  }, [restaurant]);

  if (!initialized) {
    return (
      <Loading type={LOADING_TYPES.CUSTOM} customLoader={SkeletonMenuItem} />
    );
  }
  if (!restaurantInfo) {
    return (
      <Box className="w-full center-full !top-[40%]">
        <Grid container>
          <Grid size={12}>
            <h3>No Data Available</h3>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Grid container className="w-full">
      <LoadingComponent
        showLoading={loading}
        customLoader={SkeletonMenuItem}
        type={LOADING_TYPES.CUSTOM}
        data={restaurantInfo}
      >
        <MenuTitle restaurant={restaurantInfo} />
        <Grid size={12} className="show-tasting-price-container">
          <DashingDisplayBox
            show={restaurantInfo?.tasting_menu_only}
            title="Tasting Menu"
            data={tastingMenuData}
          />
        </Grid>
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
