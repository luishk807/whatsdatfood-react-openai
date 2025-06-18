import "./index.css";
import { Grid } from "@mui/material";
const Loading = ({ style }: any) => {
  return (
    <Grid container style={style}>
      <Grid size={12}>
        <img className="loading-icon" src="/loading.gif" alt="loading" />
      </Grid>
    </Grid>
  );
};

export default Loading;
