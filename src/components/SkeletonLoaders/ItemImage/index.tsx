import { Box, Grid, Skeleton } from "@mui/material";
const SkeletonMenuImageItem = () => {
  return (
    <Box className="w-full h-full">
      <Skeleton
        animation="wave"
        variant="rectangular"
        height="100%"
        width="100%"
      />
    </Box>
  );
};

export default SkeletonMenuImageItem;
