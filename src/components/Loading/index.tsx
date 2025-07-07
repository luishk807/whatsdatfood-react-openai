import { FC, useMemo } from "react";
import "./index.css";
import { LOADING_TYPES } from "@/customConstants";
import Grid from "@mui/material/Grid";
import { CircularProgress, LinearProgress, Box } from "@mui/material";
import { LoadingInterface } from "@/interfaces";
import SkeletonMenuItem from "../SkeletonLoaders/MenuResultPage";

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
      minHeight={20}
    >
      <Grid size={12} className="w-full" textAlign="center">
        <LoadingContainer />
      </Grid>
    </Grid>
  );
};

export default Loading;
