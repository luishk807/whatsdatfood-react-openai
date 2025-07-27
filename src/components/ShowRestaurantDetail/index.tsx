import Modal from "@/components/Modal";
import { Box, Grid } from "@mui/material";
import "./index.css";
import { useEffect, type FC, useState } from "react";
import { ShowRestaurantDetailI } from "@/interfaces/restaurants";
import Button from "@/components/Button";
import { getRestNameAddress } from "@/utils";
import RestaurantAmenitiesIcon from "../RestaurantAmenitiesIcon";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const ShowRestaurantDetail: FC<ShowRestaurantDetailI> = ({ data }) => {
  const [googleQuery, setGoogleQuery] = useState("");

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

  useEffect(() => {
    if (data) {
      const query = getRestNameAddress(data);
      if (query) {
        setGoogleQuery(query);
      }
    }
  }, [data]);

  if (!data) {
    return;
  }
  return (
    <Modal customButton={<CustomButton />}>
      <Box
        className="center-full show-restaurant-detail bg-white-shawdow"
        sx={{
          padding: "20px",
          width: { lg: "400px", xs: "100%" },
        }}
      >
        <Grid container className="w-full">
          <Grid size={12} className="flex justify-center">
            <h2>Restaurant Info</h2>
          </Grid>
          <Grid size={12}>
            {googleQuery && (
              <div style={{ width: "100%", height: "250px" }}>
                <iframe
                  title="Google Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${googleQuery}`}
                ></iframe>
              </div>
            )}
          </Grid>
          <Grid size={12}>
            <RestaurantAmenitiesIcon restaurant={data} />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ShowRestaurantDetail;
