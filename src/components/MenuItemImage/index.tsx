import { Box } from "@mui/material";
import Image from "@/components/Image";
import { _get } from "@/utils";
import { RestaurantItemImageType } from "@/types";
import { MenuItemImageInterface } from "@/interfaces";
import { getRestaurantItemImages } from "@/api/restaurants";
import "./index.css";
import { useState, useEffect } from "react";

const MenuItemImage = <T,>({ data }: MenuItemImageInterface<T>) => {
  const [imageInfo, setImageInfo] = useState<RestaurantItemImageType | null>(
    null,
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    let cancelled = false;

    const fetchImage = async () => {
      const restItemId = _get<number>(data, "id");
      const dbImage = _get(data, "restaurantItemImageRestItem.0", {});

      let imageData = {};

      if (!Object.keys(dbImage).length) {
        try {
          const imageResp = await getRestaurantItemImages(restItemId);
          if (imageResp) {
            imageData = {
              ...imageResp,
            };
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        imageData = {
          ...dbImage,
        };
      }

      if (imageData && !cancelled) {
        setImageInfo({
          restaurant_menu_item_id: _get(imageData, "restaurant_menu_item_id"),
          name: _get(imageData, "name"),
          url_m: _get(imageData, "url_m"),
          url_s: _get(imageData, "url_s"),
          owner: _get(imageData, "owner"),
          license: _get(imageData, "license"),
          flickr_id: _get(imageData, "flickr_id"),
          category: _get(imageData, "category"),
        });
      }
    };

    fetchImage();

    return () => {
      cancelled = true;
    };
  }, [data]);

  return (
    <Box>
      <Image url={imageInfo?.url_m} alt={imageInfo?.name} />
    </Box>
  );
};

export default MenuItemImage;
