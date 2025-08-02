import { useEffect, useState, type FC } from "react";
import { Grid } from "@mui/material";
import useUserRating from "@/customHooks/useUserRating";
import { UserRating } from "@/interfaces/users";
import {
  MenuItemType,
  RestaurantItemImageType,
} from "@/interfaces/restaurants";
import "./index.css";
import { LIMIT_DEFAULT, PAGE_DEFAULT } from "@/customConstants";
import { _get } from "@/utils";
import Image from "@/components/Image";
import Rating from "@/components/Rating";

const UserRatingsSection: FC = () => {
  const { getUserRatingsByUser, getAllUserRatingByUserQuery } = useUserRating();
  const { loading } = getAllUserRatingByUserQuery;
  const [ratings, setRatings] = useState<UserRating[]>([]);

  const fetchRatingInfo = async () => {
    const page = PAGE_DEFAULT;
    const limit = LIMIT_DEFAULT;
    const resp = await getUserRatingsByUser(page, limit);

    if (resp) {
      const data = _get(resp, "data");
      const totalItems = _get(resp, "totalItems");
      const totalPages = _get(resp, "totalPages");
      const currentPage = _get(resp, "currentPage");

      setRatings(data as UserRating[]);
    } else {
      throw new Error("ERROR: unable to fetch user ratings");
    }
  };
  useEffect(() => {
    fetchRatingInfo();
  }, []);

  if (loading) {
    return <div>...loading</div>;
  }

  return (
    <Grid container className="w-full">
      {!!ratings.length &&
        ratings.map((data, indx) => {
          const item: MenuItemType = _get(data, "restaurantMenuItem");
          const images: RestaurantItemImageType = _get(item, "images.0");
          console.log("item", item);
          return (
            <Grid
              size={12}
              key={indx}
              sx={{
                padding: "10px 0px",
              }}
              className="line-separator-top"
            >
              <Grid container className="w-full">
                <Grid size={4}>
                  <Image url={images.url_m} />
                </Grid>
                <Grid size={6}>
                  <div>{item.name}</div>
                  <div>{data.title}</div>
                  <div>
                    <Rating defaultValue={data.rating} isDisplay={true} />
                  </div>
                </Grid>
                <Grid size={2}>
                  <ul>
                    <li>delete</li>
                    <li>edit</li>
                  </ul>
                </Grid>
              </Grid>
            </Grid>
          );
        })}
    </Grid>
  );
};

export default UserRatingsSection;
