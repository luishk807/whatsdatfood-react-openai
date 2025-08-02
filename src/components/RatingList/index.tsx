import { type FC, useEffect, useState } from "react";
import { Box, Grid, Link } from "@mui/material";
import "./index.css";
import useUserRating from "@/customHooks/useUserRating";
import { _get } from "@/utils";
import { UserRating, RatingListComponentInterface } from "@/interfaces/users";
import UserRatingItem from "@/components/RatingItem";
import { LIMIT_DEFAULT, PAGE_DEFAULT } from "@/customConstants";

const RatingListComponent: FC<RatingListComponentInterface> = ({
  data,
  onOpenCreate,
}) => {
  const [ratingLists, setRatingLists] = useState<UserRating[]>([]);

  const page = PAGE_DEFAULT;
  const limit = LIMIT_DEFAULT;
  const { getUserRatingsByItemId, getAllRatingByRestItemIdQuery } =
    useUserRating();
  const { loading } = getAllRatingByRestItemIdQuery;

  const getAllUserRating = async (restItemId: number) => {
    const resp = await getUserRatingsByItemId(restItemId, page, limit);
    if (resp) {
      const { data } = resp;
      console.log("ratings", data);
      setRatingLists(data as UserRating[]);
    } else {
      setRatingLists([]);
    }
  };
  useEffect(() => {
    const itemId = _get(data, "id");
    if (itemId) {
      getAllUserRating(Number(itemId));
    }
  }, [data]);

  return (
    <>
      <Box className="w-full flex justify-between">
        <Grid container className="w-full">
          <Grid
            size={7}
            sx={{
              justifyContent: "space-between",
              fontWeight: { xs: "bold" },
              padding: { xs: "10px" },
            }}
          >
            {data.name}
          </Grid>
          <Grid
            size={5}
            sx={{
              justifyContent: "end",
              display: "flex",
              padding: { xs: "10px" },
            }}
          >
            <Link href="#" onClick={onOpenCreate} underline="hover">
              Write you review
            </Link>
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          height: {
            lg: "540px",
            xs: "80vh",
          },
          padding: {
            xs: "20px",
          },
        }}
        className="rating-model-list-ratings"
      >
        {ratingLists.map((rating: UserRating, indx) => {
          return (
            <Box className="user-rating-item-container" key={indx}>
              <UserRatingItem data={rating} />
            </Box>
          );
        })}

        {!!!ratingLists.length && !loading && (
          <Box className="user-rating-item-container flex justify-center">
            <h3>No ratings found for this item.</h3>
          </Box>
        )}
      </Box>
    </>
  );
};
export default RatingListComponent;
