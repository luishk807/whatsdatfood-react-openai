import RatingCustom from "../Rating";
import { type FC, useMemo, useState } from "react";
import { Box, Grid, TextField } from "@mui/material";
import "./index.css";
import Modal from "@/components/Modal";
// import FormComponent from "@/components/FormComponent";
import Button from "../Button";
import useUser from "@/customHooks/useUser";
import { _get } from "@/utils";
import useSnackbarHook from "@/customHooks/useSnackBar";
import { getTotalRatings } from "@/utils";
import {
  RatingComponentInterface,
  RatingPayloadType,
} from "@/interfaces/users";

const RatingComponent: FC<RatingComponentInterface> = ({ data }) => {
  const [closeModal, setCloseModal] = useState(false);
  const [formData, setFormData] = useState<RatingPayloadType>({
    rating: null,
    title: null,
    comment: null,
    restaurant_menu_item_id: _get(data, "id"),
  });

  const ratingNumbers = useMemo(() => {
    return data.ratings ? getTotalRatings(data.ratings) : 0;
  }, [data.ratings]);

  const { submitRating } = useUser();
  const { showSnackBar, SnackbarComponent, closeSnackBar } = useSnackbarHook();
  // const formFields: FormFieldType[] = CREATE_RATING;

  const handleRateSubmit = async () => {
    console.log("rest item", formData);
    try {
      const resp = await submitRating(formData);

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
        setTimeout(() => {
          closeSnackBar();
        }, 2000);
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

  return (
    <>
      <Modal
        closeOnParent={closeModal}
        customButton={
          <RatingCustom isDisplay={true} defaultValue={Number(ratingNumbers)} />
        }
      >
        <Box
          className="rating-content-container w-full"
          sx={{
            padding: { lg: "10px", xs: "0px" },
            width: { lg: "500px", xs: "100%" },
          }}
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
              <Button onClick={handleRateSubmit}>Submit Rating</Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      {SnackbarComponent}
    </>
  );
};
export default RatingComponent;
