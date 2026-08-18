import { useEffect, useState, type FC } from "react";
import useUserRating from "@/customHooks/useUserRating";
import { UserRating } from "@/interfaces/users";
import {
  MenuItemType,
  RestaurantItemImageType,
} from "@/interfaces/restaurants";
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
    <div className="w-full">
      {!!ratings.length &&
        ratings.map((data) => {
          const item: MenuItemType = _get(data, "restaurantMenuItem");
          const images: RestaurantItemImageType = _get(item, "images.0");
          return (
            <div
              key={data.id}
              className="line-separator-top grid w-full grid-cols-12 py-[10px]"
            >
              <div className="col-span-4">
                <Image url={images.url_m} />
              </div>
              <div className="col-span-6">
                <div>{item.name}</div>
                <div>{data.title}</div>
                <div>
                  <Rating defaultValue={data.rating} isDisplay={true} />
                </div>
              </div>
              <div className="col-span-2">{data.status.name}</div>
            </div>
          );
        })}
    </div>
  );
};

export default UserRatingsSection;
