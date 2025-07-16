import { FC, useMemo } from "react";
import "./index.css";
import { LOADING_TYPES } from "@/customConstants";
import Grid from "@mui/material/Grid";
import { CircularProgress, LinearProgress } from "@mui/material";
import { LoadingInterface } from "@/interfaces";
import loadingGif from "@/assets/loading.gif";

const Loading = ({
  style,
  type = LOADING_TYPES.SPINER,
  customLoader: CustomComponent,
}: LoadingInterface) => {
  const LoadingContainer: FC = useMemo(() => {
    switch (type) {
      case LOADING_TYPES.LINEAR:
        return () => <LinearProgress />;
      case LOADING_TYPES.CIRCULAR:
        return () => <CircularProgress />;
      case LOADING_TYPES.CUSTOM:
        return () => (CustomComponent ? <CustomComponent /> : null);
      default:
        return () => (
          <img className="loading-icon" src={loadingGif} alt="loading" />
        );
    }
  }, [type]);
  return (
    <Grid
      container
      style={style}
      className="w-full justify-center items-center"
      minHeight={20}
    >
      <Grid size={12} className="w-full h-full flex" textAlign="center">
        <LoadingContainer />
      </Grid>
    </Grid>
  );
};

export default Loading;
