import { Grid } from "@mui/material";
import { type FC } from "react";
import "./index.css";

const NotFound: FC = () => {
  return (
    <Grid container>
      <Grid
        size={12}
        display="flex"
        justifyContent="center"
        alignContent="center"
      >
        <div className="not-found-section center-middle">Not Found</div>
      </Grid>
    </Grid>
  );
};

export default NotFound;
