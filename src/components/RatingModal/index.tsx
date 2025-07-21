import RatingCustom from "../Rating";
import { type FC } from "react";
import { Box } from "@mui/material";
import { CREATE_RATING } from "@/customConstants/forms";
import { FormFieldType } from "@/types";
import "./index.css";
import Modal from "@/components/Modal";
import { MenuItemType } from "@/types/restaurants";
import FormComponent from "@/components/FormComponent";
import useUser from "@/customHooks/useUser";
import { _get } from "@/utils";

interface RatingComponentInterface {
  data: MenuItemType;
}
const RatingComponent: FC<RatingComponentInterface> = ({ data }) => {
  const { submitRating, submitRatingQuery } = useUser();
  const { loading } = submitRatingQuery;
  const formFields: FormFieldType[] = CREATE_RATING;

  const handleRateSubmit = async (rating: any) => {
    console.log("submit", rating);
    console.log("rest item", data);
    try {
      const resp = await submitRating({
        ...rating,
        restaurant_menu_item_id: _get(data, "id"),
      });
      console.log(resp);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  };

  return (
    <Modal customButton={<RatingCustom isDisplay={true} defaultValue={0} />}>
      <Box
        className="rating-content-container w-full"
        sx={{
          padding: { lg: "10px", xs: "0px" },
          width: { lg: "500px", xs: "100%" },
        }}
      >
        <FormComponent
          submitLabel="Send My Rate"
          onHandleSubmit={handleRateSubmit}
          fields={formFields}
          title={`Rate ${data.name}`}
        />
        {/* <Grid container spacing={2} className="w-full">
          <Grid size={12} className="w-full flex display justify-center">
            <h2>Rate {data.name}</h2>
          </Grid>
          <Grid size={12} className="flex justify-center flex-col">
            <Grid container className="flex justify-center flex-col">
              <Grid size={12} className="flex w-fill justify-center">
                Your Review
              </Grid>
              <Grid size={12} className="flex justify-center">
                <RatingCustom
                  label="Your Review"
                  defaultValue={0}
                  onClick={handleRatingChange}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12} className="flex flex-col">
            Subject
            <input
              id="ftext-textfield"
              className="field-container"
              type="text"
            />
          </Grid>
          <Grid size={12} className="flex flex-col">
            Comment
            <TextField
              id="fiend-textfield"
              className="field-container"
              placeholder="Write something"
              fullWidth
            />
          </Grid>
          <Grid size={12}>
            <Button onClick={handleRateSubmit}>Submit Rating</Button>
          </Grid>
        </Grid> */}
      </Box>
    </Modal>
  );
};
export default RatingComponent;
