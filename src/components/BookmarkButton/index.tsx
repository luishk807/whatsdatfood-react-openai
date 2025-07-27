import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
// import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { Grid, Box, Skeleton, IconButton } from "@mui/material";
import useUser from "@/customHooks/useUser";
import "./index.css";
import { FC } from "react";

interface BookmarkButtonInt {
  slug: string;
}
const BookmarkButton: FC<BookmarkButtonInt> = ({ slug }) => {
  const { saveFavorites, submitUserFavoritesQuery } = useUser();
  const { loading, error } = submitUserFavoritesQuery;
  const handleSaveButton = async () => {
    if (slug) {
      console.log(slug);
      //   const resp = await saveFavorites({
      //     user_id: user.id,
      //     restaurant_id: restaurant_id,
      //   });
    }
  };
  return (
    <Grid className="w-full flex justify-end">
      <Box className="bookmark-icon-container">
        Favorite&nbsp;
        <IconButton onClick={handleSaveButton}>
          <FavoriteBorderRoundedIcon />
        </IconButton>
      </Box>
    </Grid>
  );
};

export default BookmarkButton;
