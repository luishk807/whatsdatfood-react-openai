import RatingCustom from "@/components/Rating";
import { type FC, useEffect, useMemo, useState } from "react";
import { Box, Grid, TextField } from "@mui/material";
import "./index.css";
import Modal from "@/components/Modal";
import useUserRating from "@/customHooks/useUserRating";
import { _get } from "@/utils";
import { getTotalRatings } from "@/utils/numbers";
import { UserRating } from "@/interfaces/users";

import { MenuItemType } from "@/interfaces/restaurants";
export interface RatingComponentListInterface {
  data: MenuItemType;
}
import UserRatingItem from "@/components/UserRatingItem";
import RatingModalCreate from "@/components/RatingModalCreate";
import "./index.css";
const RatingModalListComponent: FC<RatingComponentListInterface> = ({
  data,
}) => {
  const [closeModal, setCloseModal] = useState(false);
  const [ratingLists, setRatingLists] = useState<UserRating[]>([]);

  const ratingNumbers = useMemo(() => {
    return data.ratings ? getTotalRatings(data.ratings) : 0;
  }, [data.ratings]);

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
      <Modal
        closeOnParent={closeModal}
        customButton={
          <RatingCustom isDisplay={true} defaultValue={Number(ratingNumbers)} />
        }
      >
        <Box
          className="rating-modal-list-container w-full"
          sx={{
            padding: { lg: "10px", xs: "0px" },
            width: { lg: "500px", xs: "100%" },
            height: {
              lg: "600px",
              xs: "100vh",
            },
          }}
        >
          <Box
            sx={{
              height: "50px",
            }}
            className="w-full flex justify-between"
          >
            <div>All Rating for {data.name}</div>
            <div>
              <RatingModalCreate
                data={data}
                type="link"
                label="Write your review"
              />
            </div>
          </Box>
          <Box
            sx={{
              height: {
                lg: "540px",
                xs: "100vh",
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
        </Box>
      </Modal>
    </>
  );
};
export default RatingModalListComponent;
