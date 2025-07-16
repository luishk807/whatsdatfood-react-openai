import Modal from "@/components/Modal";
import { Box, Grid, TextField } from "@mui/material";
import "./index.css";
import { useEffect, type FC } from "react";
import { SendFriendModalInterface } from "@/interfaces";
import Button from "@/components/Button";
import Image from "@/components/Image";

const SendFriendModal: FC<SendFriendModalInterface> = ({ data }) => {
  const handleSendFriend = (e: any) => {
    console.log("got here");
  };

  return (
    <Modal label="Send to friend">
      <Box
        id="send-friend-modal"
        sx={{
          padding: { lg: "10px", xs: "0px" },
          width: { lg: "400px", xs: "100%" },
        }}
      >
        <Grid container className="w-full">
          <Grid size={12} className="flex justify-center">
            <h2>Send to friend</h2>
          </Grid>
          <Grid size={12}>
            <Grid container className="send-friend-item-container">
              <Grid size={12} className="send-friend-image-holder">
                <Image
                  url={data ? data.image : null}
                  alt={data && data?.restaurantName}
                />
              </Grid>
              <Grid size={12} className="flex justify-center">
                <h3>{data && `${data.restaurantName} ${data.price}`}</h3>
              </Grid>
              <Grid size={12} className="flex justify-center">
                {data && data.address}
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12} className="flex justify-center w-full">
            <TextField
              id="fiend-textfield"
              placeholder="Write something"
              fullWidth
            />
          </Grid>
          <Grid
            size={12}
            className="flex justify-center send-friend-modal-button"
          >
            <Button onClick={handleSendFriend}>Send friend button</Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default SendFriendModal;
