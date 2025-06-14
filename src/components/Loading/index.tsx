import "./index.css";
import { Grid } from "@mui/material";
const Loading = () => {
  return (
    <Grid container>
      <Grid size={12}>
        <img className="loading-icon" src="/loading.gif" alt="loading" />;
      </Grid>
    </Grid>
  );
};

export default Loading;
