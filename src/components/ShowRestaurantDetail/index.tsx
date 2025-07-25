import Modal from "@/components/Modal";
import { Box, Grid, TextField } from "@mui/material";
import "./index.css";
import { useEffect, type FC } from "react";
import { ShowRestaurantDetailI } from "@/interfaces/restaurants";
import Button from "@/components/Button";

const ShowRestaurantDetail: FC<ShowRestaurantDetailI> = ({ data }) => {
  const CustomButton = () => {
    return (
      <Box>
        <Button
          sx={{
            width: {
              lg: "300px !important",
              xs: "80% !important",
            },
            padding: "10px 0px",
            borderRadius: "20px",
            margin: {
              lg: "10px 0px",
              xs: "0px",
            },
          }}
        >
          Show More Restaurant Detail
        </Button>
      </Box>
    );
  };

  if (!data) {
    return;
  }
  return (
    <Modal customButton={<CustomButton />}>
      <Box
        className="center-full show-restaurant-detail bg-white-shawdow"
        sx={{
          padding: { lg: "10px", xs: "0px" },
          width: { lg: "400px", xs: "100%" },
        }}
      >
        <Grid container className="w-full">
          <Grid size={12} className="flex justify-center">
            <h2>Restaurant Info</h2>
          </Grid>
          <Grid size={12}>{data?.delivery_method}</Grid>

          <Grid size={12} className="flex justify-center">
            <Grid container className="w-full menu-result-info-container">
              <Grid size={6} className="menu-result-info-title">
                Delivery Methods
              </Grid>
              <Grid size={6} className="menu-result-info-data">
                {data.delivery_method || "N/A"}
              </Grid>
            </Grid>
          </Grid>

          <Grid size={12} className="flex justify-center">
            <Grid container className="w-full menu-result-info-container">
              <Grid size={6} className="menu-result-info-title">
                Sanitary Grade
              </Grid>
              <Grid size={6} className="menu-result-info-data">
                &nbsp;{data.letter_grade || "N/A"}
              </Grid>
            </Grid>
          </Grid>

          <Grid size={12} className="flex justify-center">
            <Grid container className="w-full menu-result-info-container">
              <Grid size={6} className="menu-result-info-title">
                Payment Method
              </Grid>
              <Grid size={6} className="menu-result-info-data">
                &nbsp;{data.payment_method || "N/A"}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ShowRestaurantDetail;
