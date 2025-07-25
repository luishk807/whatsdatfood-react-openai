import { Grid, Box } from "@mui/material";
import { type FC } from "react";
import { DashingDisplayBoxInt } from "interfaces";
import "./index.css";
const DashingDisplayBox: FC<DashingDisplayBoxInt> = ({ title, data, show }) => {
  if (!show || !data) {
    return;
  }
  return (
    <Box
      id="show-tasting-price-box"
      className={`${title && "title-spacing"}`}
      sx={{
        margin: {
          xs: "10px",
        },
      }}
    >
      {title && <Box className="show-tasting-title">{title}</Box>}
      {data.map((item, indx) => (
        <Grid container key={indx}>
          <Grid size={6} className="show-tasting-label">
            {item.label}
          </Grid>
          <Grid size={6} className="show-tasting-value">
            {item.value}
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default DashingDisplayBox;
