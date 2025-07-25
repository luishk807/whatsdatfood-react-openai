import { Grid, Box, IconButton } from "@mui/material";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import IconLinkButton from "../IconLinkButton";
import { RestaurantType } from "@/interfaces/restaurants";
import { type FC } from "react";

interface RestaurantIconMenuInt {
  restaurant: RestaurantType;
}
const RestaurantIconMenu: FC<RestaurantIconMenuInt> = ({ restaurant }) => {
  const style = {
    fontSize: {
      lg: "1em",
      xs: "2.5em",
    },
    color: {
      xs: "white",
      lg: "black",
    },
  };
  return (
    <Box
      sx={{
        backgroundColor: {
          xs: "black",
          lg: "white",
        },
      }}
    >
      <Grid container>
        <Grid size={12} className="flex justify-around">
          <IconButton
            aria-label="make a phonecall"
            component="a"
            href={`tel:${restaurant.phone}`}
          >
            <PhoneIphoneRoundedIcon sx={style} />
          </IconButton>
          <IconButton
            component="a"
            rel="noopener noreferrer"
            aria-label="open website"
            href={`${restaurant.website}`}
            target="_blank"
          >
            <LanguageRoundedIcon sx={style} />
          </IconButton>
          <IconButton
            aria-label="send email"
            component="a"
            href={`mail:${restaurant.email}`}
          >
            <MailOutlineRoundedIcon sx={style} />
          </IconButton>
          <IconButton aria-label="share this" component="a" href="/">
            <IosShareRoundedIcon sx={style} />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RestaurantIconMenu;
