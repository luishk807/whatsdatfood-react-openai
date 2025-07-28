import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
// import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { Grid, Box, Skeleton, IconButton } from "@mui/material";
import useUserFavorite from "@/customHooks/useUserFavorites";
import "./index.css";
import { type FC, useEffect, useState } from "react";
import useSnackbarHook from "@/customHooks/useSnackBar";

interface BookmarkButtonInt {
  slug: string;
  defaultValue?: boolean;
}
const BookmarkButton: FC<BookmarkButtonInt> = ({ slug, defaultValue }) => {
  const {
    saveFavorites,
    checkUserFavoritesQuery,
    isUserFavorite,
    submitUserFavoritesQuery,
  } = useUserFavorite();
  const { SnackbarComponent, showSnackBar } = useSnackbarHook();
  const [isSaved, setIsSaved] = useState(defaultValue);
  const { loading, error } = submitUserFavoritesQuery;

  const handleSaveButton = async () => {
    if (slug) {
      console.log(slug);
      try {
        const resp = await saveFavorites(slug);
        if (resp) {
          console.log("resp", resp);
          showSnackBar("Restaurant Saved!", "success");
          setIsSaved(true);
        } else {
          showSnackBar("Unable to save favorite", "error");
        }
      } catch (err) {
        showSnackBar("Unable to save favorite", "error");
      }

      //   const resp = await saveFavorites({
      //     user_id: user.id,
      //     restaurant_id: restaurant_id,
      //   });
    }
  };

  const checkUserFavorite = async () => {
    const resp = await isUserFavorite(slug);
    if (resp) {
      console.log(resp);
    }
  };
  useEffect(() => {
    if (slug) {
      checkUserFavorite();
    }
  }, [slug]);
  return (
    <>
      {SnackbarComponent}
      <Grid className="w-full flex justify-end">
        <Box className="bookmark-icon-container">
          Favorite&nbsp;
          <IconButton onClick={handleSaveButton}>
            {isSaved ? (
              <FavoriteRoundedIcon style={{ color: "red" }} />
            ) : (
              <FavoriteBorderRoundedIcon />
            )}
          </IconButton>
        </Box>
      </Grid>
    </>
  );
};

export default BookmarkButton;
