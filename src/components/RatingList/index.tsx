import { type FC, useEffect, useState } from "react";
import { Box, Link } from "@mui/material";
import "./index.css";
import useUserRating from "@/customHooks/useUserRating";
import { _get } from "@/utils";
import { UserRating, RatingListComponentInterface } from "@/interfaces/users";
import UserRatingItem from "@/components/UserRatingItem";
import "./index.css";
import Button from "@/components/Button";

const RatingListComponent: FC<RatingListComponentInterface> = ({
  data,
  onOpenCreate,
}) => {
  const [ratingLists, setRatingLists] = useState<UserRating[]>([]);

  const { getAllRatingsByItemId, allUserRatingByRestItemIdQuery } =
    useUserRating();
  const { loading } = allUserRatingByRestItemIdQuery;

  const getAllUserRating = async (restItemId: number) => {
    const resp = await getAllRatingsByItemId(restItemId, 1);
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
      <Box
        sx={{
          height: "50px",
          margin: {
            xs: "10px 0px",
          },
        }}
        className="w-full flex justify-between"
      >
        {/* <Box>X</Box> */}
        <Box sx={{ fontWeight: { xs: "bold" }, padding: { xs: "10px" } }}>
          All Rating for {data.name}
        </Box>
        <Box sx={{ padding: { xs: "10px" } }}>
          <Link href="#" onClick={onOpenCreate} underline="hover">
            Write you review
          </Link>
        </Box>
      </Box>
      <Box
        sx={{
          height: {
            lg: "540px",
            xs: "100vh",
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
      </Box>
    </>
  );
};
export default RatingListComponent;
