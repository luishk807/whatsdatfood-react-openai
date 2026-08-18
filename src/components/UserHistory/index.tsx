import { useEffect, useState, type FC } from "react";
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
    <div className="w-full">
      {!!userViews.length ? (
        userViews.map((view) => {
          const restaurant: RestaurantType = _get(view, "restaurant");
          return (
            <div
              key={view.id}
              className="line-separator-top grid w-full grid-cols-12 py-[5px]"
            >
              <div className="col-span-10 flex justify-start">
                {restaurant.name}
              </div>
              <div className="col-span-2 flex justify-end">
                {getDate(view.createdAt)}
              </div>
            </div>
          );
        })
      ) : (
        <div>No views</div>
      )}
    </div>
  );
};

export default UserHistory;
