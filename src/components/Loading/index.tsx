import { FC, useMemo } from "react";
import "./index.css";
import { LOADING_TYPES } from "@/customConstants";
import Grid from "@mui/material/Grid";
import { CircularProgress, LinearProgress } from "@mui/material";
import { LoadingInterface } from "@/interfaces";

const Loading = ({ style, type = "custom" }: LoadingInterface) => {
  const LoadingContainer: FC = useMemo(() => {
    switch (type) {
      case LOADING_TYPES.LINEAR:
        return () => <LinearProgress />;
      case LOADING_TYPES.CIRCULAR:
        return () => <CircularProgress />;
      default:
        return () => (
          <img className="loading-icon" src="/loading.gif" alt="loading" />
        );
    }
  }, [type]);
  return (
    <Grid
      container
      style={style}
      width="100%"
      justifyContent="center"
      alignItems="center"
      minHeight={100}
    >
      <Grid size={12} textAlign="center">
        <LoadingContainer />
      </Grid>
    </Grid>
  );
};

export default Loading;
