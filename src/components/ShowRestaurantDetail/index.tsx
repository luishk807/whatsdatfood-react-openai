import Modal from "@/components/Modal";
import { Box, Grid, TextField } from "@mui/material";
import "./index.css";
import { useEffect, type FC } from "react";
import { ShowRestaurantDetailI } from "@/interfaces/restaurants";
import Button from "@/components/Button";

const ShowRestaurantDetail: FC<ShowRestaurantDetailI> = ({ data }) => {
  const handleSendFriend = (e: any) => {
    console.log("got here");
  };

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
  return (
    <Modal customButton={<CustomButton />}>
      <Box
        id="send-friend-modal"
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
        </Grid>
      </Box>
    </Modal>
  );
};

export default ShowRestaurantDetail;
