import RatingCustom from "../Rating";
import { type FC, useEffect, useMemo, useState } from "react";
import { Box, Grid, TextField } from "@mui/material";
import "./index.css";
import Modal from "@/components/Modal";
// import FormComponent from "@/components/FormComponent";
import Button from "../Button";
import useUserRating from "@/customHooks/useUserRating";
import { _get } from "@/utils";
import useSnackbarHook from "@/customHooks/useSnackBar";
import { getTotalRatings } from "@/utils/numbers";
import {
  RatingModalCreateInterface,
  RatingPayloadType,
  UserRating,
} from "@/interfaces/users";

const RatingModalCreate: FC<RatingModalCreateInterface> = ({
  data,
  label,
  type,
}) => {
  const [closeModal, setCloseModal] = useState(false);
  const [foundUserRating, setFoundUserRating] = useState(false);
  const [formData, setFormData] = useState<RatingPayloadType>({
    id: null,
    rating: null,
    title: null,
    comment: null,
    restaurant_menu_item_id: _get(data, "id"),
  });

  const ratingNumbers = useMemo(() => {
    return data.ratings ? getTotalRatings(data.ratings) : 0;
  }, [data.ratings]);

  const { saveRating, getUserRatingByItemId, userRatingByRestItemIdQuery } =
    useUserRating();
  const { loading } = userRatingByRestItemIdQuery;
  const { showSnackBar, SnackbarComponent } = useSnackbarHook();

  const handleRateSubmit = async () => {
    try {
      const resp = await saveRating(formData);

      if (resp) {
        setFormData({
          ...formData,
          rating: null,
          title: null,
          comment: null,
        });
        showSnackBar("Your rating was saved", "success");
        setCloseModal(true);
        setTimeout(() => setCloseModal(false), 500);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  };

  const handleRatingChange = (value: any, name: keyof RatingPayloadType) => {
    if (value) {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: null,
      });
    }
  };

  const getUserRating = async (restItemId: number) => {
    const resp = await getUserRatingByItemId(restItemId);
    if (resp) {
      setFoundUserRating(true);
      setFormData({
        ...formData,
        id: _get(resp, "id"),
        title: _get(resp, "title"),
        comment: _get(resp, "comment"),
        rating: _get(resp, "rating"),
      });
    } else {
      setFoundUserRating(false);
    }
  };
  useEffect(() => {
    const itemId = _get(data, "id");
    const ratings = _get(data, "ratings.0");
    if (ratings && itemId && Object.keys(itemId).length) {
      getUserRating(Number(itemId));
    }
  }, [data]);

  return (
    <>
      <Modal
        closeOnParent={closeModal}
        type={type}
        {...(!label
          ? {
              customButton: (
                <RatingCustom
                  isDisplay={true}
                  defaultValue={Number(ratingNumbers)}
                />
              ),
            }
          : { label: label })}
      >
        {/* TODO: using this component is much better
          but for some reason is causing re-render */}
        {/* <FormComponent
            submitLabel="Send My Rate"
            onHandleSubmit={handleRateSubmit}
            fields={formFields}
            title={`Rate ${data.name}`}
          /> */}
        <Grid container spacing={2} className="w-full">
          <Grid size={12} className="w-full flex display justify-center">
            <h2>Rate {data.name}</h2>
          </Grid>
          <Grid size={12} className="flex justify-center flex-col">
            Your Review
            <RatingCustom
              label="Your Review"
              defaultValue={Number(formData.rating)}
              onClick={(value: number) => handleRatingChange(value, "rating")}
            />
          </Grid>
          <Grid size={12} className="flex flex-col">
            Subject
            <input
              onChange={(e) => handleRatingChange(e.target.value, "title")}
              value={formData.title || ""}
              name="title"
              className="field-container"
              type="text"
            />
          </Grid>
          <Grid size={12} className="flex flex-col">
            Comment
            <TextField
              value={formData.comment || ""}
              onChange={(e) => handleRatingChange(e.target.value, "comment")}
              minRows={2}
              name="comment"
              className="field-container"
              placeholder="Write something"
              fullWidth
            />
          </Grid>
          <Grid size={12}>
            <Button onClick={handleRateSubmit}>
              {foundUserRating ? "Update Rating" : "Submit Rating"}
            </Button>
          </Grid>
        </Grid>
      </Modal>
      {SnackbarComponent}
    </>
  );
};
export default RatingModalCreate;
