import { Box, Skeleton } from "@mui/material";
const RectangleSkeleton = () => {
  return (
    <Box
      sx={{
        width: "100%",
        margin: "10px 0px",
      }}
    >
      <Skeleton animation="wave" height={10} width="100%" />
    </Box>
  );
};

export default RectangleSkeleton;
