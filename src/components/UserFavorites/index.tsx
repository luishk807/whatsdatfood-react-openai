import { useEffect, useState, type FC } from "react";
import { UserFavorites } from "@/interfaces/users";
import useUserFavorite from "@/customHooks/useUserFavorites";
import { _get } from "@/utils";
import { getDate } from "@/utils/time";
import { LIMIT_DEFAULT, PAGE_DEFAULT } from "@/customConstants";

const UserFavoritesSection: FC = () => {
  const [favorites, setFavorites] = useState<UserFavorites[]>();
  const { getAllUserFavorites, getAllUserFavoritesQuery } = useUserFavorite();
  const { data, loading, error } = getAllUserFavoritesQuery;
  const page = PAGE_DEFAULT;
  const limit = LIMIT_DEFAULT;

  useEffect(() => {
    const fetchAllFavorites = async () => {
      const resp = await getAllUserFavorites(page, limit);
      if (resp) {
        const data = _get(resp, "data");
        const totalItems = _get(resp, "totalItems");
        const totalPages = _get(resp, "totalPages");
        const currentPage = _get(resp, "currentPage");

        setFavorites(data as UserFavorites[]);
      } else {
        console.error("Failed to fetch favorites");
      }
    };

    fetchAllFavorites();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {favorites &&
        !!favorites.length &&
        favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="line-separator-top grid grid-cols-12 py-[10px]"
          >
            <div className="col-span-6 flex justify-start">
              {favorite.restaurant.name}
            </div>
            <div className="col-span-2 flex justify-center">
              {getDate(favorite.createdAt)}
            </div>
            <div className="col-span-4 flex justify-end">delete</div>
          </div>
        ))}
    </div>
  );
};

export default UserFavoritesSection;
