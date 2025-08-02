import { useEffect, useState, type FC } from "react";
import { Grid } from "@mui/material";
import "./index.css";
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
        console.log("Fetched favorites:", resp);
        const data = _get(resp, "data");
        const totalItems = _get(resp, "totalItems");
        const totalPages = _get(resp, "totalPages");
        const currentPage = _get(resp, "currentPage");

        console.log(data);
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
    <Grid container id="user-favorites-section">
      {favorites &&
        !!favorites.length &&
        favorites.map((favorite, indx) => (
          <>
            <Grid
              size={12}
              key={indx}
              className="user-favorite-item line-separator-top"
            >
              <Grid container>
                <Grid size={6} className="flex justify-start">
                  {favorite.restaurant.name}
                </Grid>
                <Grid size={2} className="flex justify-center">
                  {getDate(favorite.createdAt)}
                </Grid>
                <Grid size={4} className="flex justify-end">
                  delete
                </Grid>
              </Grid>
            </Grid>
          </>
        ))}
    </Grid>
  );
};

export default UserFavoritesSection;
