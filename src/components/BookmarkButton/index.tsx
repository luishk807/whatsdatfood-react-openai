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
      try {
        const resp = await saveFavorites(slug);
        if (resp) {
          showSnackBar("Restaurant Saved!", "success");
        } else {
          showSnackBar("Unable to save favorite", "error");
        }
      } catch (err) {
        showSnackBar("Unable to save favorite", "error");
      } finally {
        await checkUserFavorite();
      }
    }
  };

  const checkUserFavorite = async () => {
    const resp = await isUserFavorite(slug);
    console.log("is saved:", resp);
    setIsSaved(!!resp);
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
