import { useEffect, useMemo, useState, type FC } from "react";
import { Grid, Skeleton, Box } from "@mui/material";
import { _get, getBuiltAddress } from "@/utils";
import { convertCurrency } from "@/utils/numbers";
import { MenuItemInterface } from "@/interfaces/restaurants";
import { SendFriendModalData } from "@/interfaces";
import { MenuInterfaceItemType } from "@/interfaces/restaurants";
import MenuItemImage from "@/components/MenuItemImage";
import MenuItemTitle from "@/components/MenuItemTitle";
import "./index.css";
import Button from "@/components/Button";
import SendFriendModal from "@/components/SendFriendModal";
import RatingComponent from "@/components/RatingModalCreate";

const MenuItem: FC<MenuItemInterface> = ({ item, restaurant }) => {
  const [sendFriendPayload, setSendPayload] =
    useState<SendFriendModalData | null>(null);
  const [showPrice, setShowPrice] = useState(true);

  useEffect(() => {
    let isMounted = false;

    if (restaurant && item) {
      if (!isMounted) {
        let address = _get(restaurant, "address", "");
        let city = _get(restaurant, "city", "");
        let state = _get(restaurant, "state", "");
        let postal_code = _get(restaurant, "postal_code", "");
        let country = _get(restaurant, "country", "");
        let image = _get(item, "url_m", "");

        const full_address = getBuiltAddress({
          address,
          city,
          state,
          postal_code,
          country,
        });

        setShowPrice(!restaurant.tasting_menu_only);

        setSendPayload({
          restaurantName: _get(restaurant, "name", ""),
          address: full_address,
          itemName: _get(item, "name", ""),
          price: _get(item, "price", ""),
          image: image,
        });
      }
    }

    return () => {
      isMounted = true;
    };
  }, [item, restaurant]);

  const handleUpdateImage = (newImage: string) => {
    if (newImage && sendFriendPayload) {
      setSendPayload({
        ...sendFriendPayload,
        image: newImage,
      });
    }
  };
  return (
    <Grid container className="item-menu-item-container">
      <Grid
        sx={{ display: { xs: "block", md: "none" } }}
        className="item-menu-item-title-mobile"
      >
        <MenuItemTitle data={item} />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }} className="item-menu-item-img">
        <MenuItemImage<MenuInterfaceItemType>
          data={item}
          onImageChange={handleUpdateImage}
        />
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
                <MenuItemTitle data={item} />
              </Grid>
              {showPrice && (
                <Grid
                  size={{ xs: 12, md: 2 }}
                  display="flex"
                  justifyContent={{ xs: "center", md: "end" }}
                  className="item-menu-item-price"
                >
                  {convertCurrency(item.price)}
                </Grid>
              )}
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
                <Button>Add to list</Button>
                <SendFriendModal data={sendFriendPayload} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MenuItem;
