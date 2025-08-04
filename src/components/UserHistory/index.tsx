import { useEffect, useState, type FC } from "react";
import { Grid } from "@mui/material";
import "./index.css";
import useUserViews from "@/customHooks/useUserViews";
import { PAGE_DEFAULT, LIMIT_DEFAULT } from "@/customConstants";
import { _get } from "@/utils";
import { getDate } from "@/utils/time";
import { UserView } from "@/interfaces/users";
import { RestaurantType } from "@/interfaces/restaurants";

const UserHistory: FC = () => {
  const [userViews, setUserViews] = useState<UserView[]>([]);
  const { getViewsByUser, getViewsByUserQuery } = useUserViews();
  const { loading: viewLoading } = getViewsByUserQuery;

  const getHistoryData = async () => {
    const page = PAGE_DEFAULT;
    const limit = LIMIT_DEFAULT;
    const views = await getViewsByUser(page, limit);

    if (views) {
      const data = _get(views, "data");
      // const totalItems = _get(searches, "totalItems");
      // const totalPages = _get(searches, "totalPages");
      // const currentPage = _get(searches, "currentPage");

      console.log(data, "data");
      setUserViews(data as UserView[]);
    }
  };
  useEffect(() => {
    getHistoryData();
  }, []);

  if (viewLoading) {
    return <div>loading</div>;
  }

  return (
    <Grid container className="w-full">
      {!!userViews.length ? (
        userViews.map((view, indx) => {
          const restaurant: RestaurantType = _get(view, "restaurant");
          return (
            <Grid size={12} key={indx} className="line-separator-top py-[5px]">
              <Grid container className="w-full">
                <Grid size={10} className="flex justify-start">
                  {restaurant.name}
                </Grid>
                <Grid size={2} className="flex justify-end">
                  {getDate(view.createdAt)}
                </Grid>
              </Grid>
            </Grid>
          );
        })
      ) : (
        <Grid size={12}>No views</Grid>
      )}
    </Grid>
  );
};

export default UserHistory;
