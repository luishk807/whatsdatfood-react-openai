import { Grid, Box, IconButton } from "@mui/material";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import { RestaurantType } from "@/interfaces/restaurants";
import { type FC } from "react";

interface RestaurantSocialOptionsInt {
  restaurant: RestaurantType;
}
const RestaurantSocialOptions: FC<RestaurantSocialOptionsInt> = ({
  restaurant,
}) => {
  const style = {
    fontSize: {
      lg: "1em",
      xs: "2em",
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
        borderBottom: {
          xs: "1px solid white",
        },
      }}
    >
      <Grid container>
        <Grid size={12} className="flex justify-around">
          {restaurant.phone && (
            <IconButton
              aria-label="make a phonecall"
              component="a"
              href={`tel:${restaurant.phone}`}
            >
              <LocalPhoneRoundedIcon sx={style} />
            </IconButton>
          )}
          {restaurant.website && (
            <IconButton
              component="a"
              rel="noopener noreferrer"
              aria-label="open website"
              href={`${restaurant.website}`}
              target="_blank"
            >
              <LanguageRoundedIcon sx={style} />
            </IconButton>
          )}
          {restaurant.email && (
            <IconButton
              aria-label="send email"
              component="a"
              href={`mailto:${restaurant.email}?subject=Reservation Inquiry&body=Hi, I'd like to make a reservation...`}
            >
              <MailOutlineRoundedIcon sx={style} />
            </IconButton>
          )}

          <IconButton aria-label="share this" component="a" href="/">
            <IosShareRoundedIcon sx={style} />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RestaurantSocialOptions;
